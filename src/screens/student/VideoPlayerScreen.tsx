/**
 * Bodhira LMS — VideoPlayerScreen v6
 * Architecture: TopicPlayer (chapter tabs + topic list + completion tracking)
 * Design: flat SVG icons, Colors.primary/brand, gradient overlays, fullscreen modal
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  StatusBar, ActivityIndicator, Dimensions, ScrollView, Animated,
  PanResponder, Platform, NativeModules, useWindowDimensions,
} from 'react-native';

// Native orientation + immersive-mode module (OrientationModule.kt)
const OrientationModule = NativeModules.OrientationModule as
  | {
      lockToLandscape:      () => void;
      unlockAllOrientations:() => void;
      enterImmersiveMode:   () => void;
      exitImmersiveMode:    () => void;
    }
  | undefined;
import Video from 'react-native-video';
import type {
  VideoRef, OnLoadData, OnProgressData, OnBufferData, OnVideoErrorData,
} from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Polygon, Polyline, Rect, Circle, Line, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';

// ─── Dimensions ────────────────────────────────────────────────────────────────
// Module-level constants used only as initial/fallback values.
// Inside the component we always use useWindowDimensions() so the layout
// re-computes on orientation changes without needing a module reload.
const { width: SW, height: SH } = Dimensions.get('window');
const LS_W  = Math.max(SW, SH);
const BAR_W = SW - 32;
const FS_BAR = LS_W - 48;

// ─── Video URI ─────────────────────────────────────────────────────────────────
// Android: copied once to the app's own internal storage via:
//   adb push video.mp4 /data/local/tmp/bodhira_video.mp4
//   adb shell "run-as com.bodhira cp /data/local/tmp/bodhira_video.mp4 /data/data/com.bodhira/files/bodhira_video.mp4"
//   Internal storage (/data/data/<pkg>/) is owned by the app — no FUSE
//   permission issues, no HTTP server required, persists across reboots.
//
// iOS Sim: macOS filesystem is shared; file:// in ~/Downloads works directly.
//
// In production replace LOCAL_VIDEO with your backend streaming URL.
const LOCAL_VIDEO = Platform.select({
  android: 'file:///data/data/com.bodhira/files/bodhira_video.mp4',
  ios:     'file:///Users/pengwinsolutions/Downloads/' +
           encodeURIComponent('vidssave.com MOANA 2 All Clips + Trailer (4K ULTRA HD) 2024 1440P.mp4'),
}) ?? '';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface TopicItem {
  id: number;
  title: string;
  durationMins: number;
  contentUrl: string | null;
  type: 'video' | 'pdf' | 'article';
}
interface ChapterItem { id: number; title: string; topics: TopicItem[] }

const SPEED_OPTS: { label: string; value: number }[] = [
  { label: '0.5×',  value: 0.5  },
  { label: '0.75×', value: 0.75 },
  { label: '1×',    value: 1    },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×',  value: 1.5  },
  { label: '2×',    value: 2    },
];

// ─── Mock course chapters ──────────────────────────────────────────────────────
const CHAPTERS: ChapterItem[] = [
  {
    id: 1, title: 'Basic Concepts',
    topics: [
      { id: 1,  title: 'Introduction to Organic Chemistry', durationMins: 8,  contentUrl: LOCAL_VIDEO, type: 'video' },
      { id: 2,  title: 'Carbon Bonding & Hybridisation',    durationMins: 12, contentUrl: null, type: 'video' },
      { id: 3,  title: 'Isomerism & Nomenclature',          durationMins: 10, contentUrl: null, type: 'video' },
      { id: 4,  title: 'IUPAC Naming Rules',                durationMins: 9,  contentUrl: null, type: 'video' },
    ],
  },
  {
    id: 2, title: 'Hydrocarbons',
    topics: [
      { id: 5,  title: 'Alkanes — Properties & Reactions',  durationMins: 11, contentUrl: null, type: 'video' },
      { id: 6,  title: 'Alkenes — Addition Reactions',      durationMins: 13, contentUrl: null, type: 'video' },
      { id: 7,  title: 'Alkynes & Triple Bonds',            durationMins: 9,  contentUrl: null, type: 'video' },
      { id: 8,  title: 'Aromatic Hydrocarbons',             durationMins: 14, contentUrl: null, type: 'video' },
    ],
  },
  {
    id: 3, title: 'Reaction Mechanisms',
    topics: [
      { id: 9,  title: 'SN1 Mechanism',                    durationMins: 13, contentUrl: null, type: 'video' },
      { id: 10, title: 'SN2 Mechanism',                    durationMins: 12, contentUrl: null, type: 'video' },
      { id: 11, title: 'Elimination Reactions (E1 / E2)',  durationMins: 11, contentUrl: null, type: 'video' },
      { id: 12, title: 'Addition Mechanisms',              durationMins: 14, contentUrl: null, type: 'video' },
      { id: 13, title: 'Mechanism Summary & Review',       durationMins: 8,  contentUrl: null, type: 'video' },
    ],
  },
  {
    id: 4, title: 'Functional Groups',
    topics: [
      { id: 14, title: 'Alcohols & Phenols',           durationMins: 12, contentUrl: null, type: 'video' },
      { id: 15, title: 'Aldehydes & Ketones',          durationMins: 15, contentUrl: null, type: 'video' },
      { id: 16, title: 'Carboxylic Acids',             durationMins: 10, contentUrl: null, type: 'video' },
      { id: 17, title: 'Amines & Amides',              durationMins: 11, contentUrl: null, type: 'video' },
    ],
  },
];

const COURSE = { subject: 'Chemistry · Grade 11–12' };

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (s: number): string => {
  if (!isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
const fmtDur = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;

const isDone = (map: Record<string, number[]>, ci: number, ti: number) =>
  (map[`c${ci}`] ?? []).includes(ti);

const chAllDone = (map: Record<string, number[]>, ci: number) =>
  CHAPTERS[ci].topics.every((_, ti) => isDone(map, ci, ti));

const HIT = { top: 12, bottom: 12, left: 12, right: 12 };

// ─── Icon ──────────────────────────────────────────────────────────────────────
type IconName =
  | 'back' | 'close' | 'chevron-right' | 'chevron-down'
  | 'play' | 'pause' | 'replay10' | 'forward10'
  | 'volume-on' | 'volume-off'
  | 'maximize' | 'minimize'
  | 'lock' | 'unlock'
  | 'check' | 'quiz' | 'flask' | 'gauge'
  | 'video-file' | 'article' | 'clock' | 'star';

interface IconProps { name: IconName; size?: number; color?: string; sw?: number; filled?: boolean }

const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#fff', sw = 2, filled = false }) => {
  const p = { stroke: color, strokeWidth: sw, strokeLinecap: 'round' as any, strokeLinejoin: 'round' as any, fill: 'none' };
  const nodes: Record<IconName, React.ReactNode> = {
    back:           <Polyline points="15 18 9 12 15 6" {...p} />,
    close:          <G {...p}><Line x1="18" y1="6" x2="6" y2="18" /><Line x1="6" y1="6" x2="18" y2="18" /></G>,
    'chevron-right':<Polyline points="9 18 15 12 9 6" {...p} />,
    'chevron-down': <Polyline points="6 9 12 15 18 9" {...p} />,
    play:           <Polygon points="5 3 19 12 5 21 5 3" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round" />,
    pause:          <G fill={color} stroke="none"><Rect x="6" y="4" width="4" height="16" rx="1.5" /><Rect x="14" y="4" width="4" height="16" rx="1.5" /></G>,
    replay10:       <G {...p}><Path d="M1 4v6h6" /><Path d="M3.51 15a9 9 0 1 0 .49-3.51" /></G>,
    forward10:      <G {...p}><Path d="M23 4v6h-6" /><Path d="M20.49 15a9 9 0 1 1-.49-3.51" /></G>,
    'volume-on':    <G {...p}><Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><Path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></G>,
    'volume-off':   <G {...p}><Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><Line x1="23" y1="9" x2="17" y2="15" /><Line x1="17" y1="9" x2="23" y2="15" /></G>,
    maximize:       <G {...p}><Polyline points="15 3 21 3 21 9" /><Polyline points="9 21 3 21 3 15" /><Line x1="21" y1="3" x2="14" y2="10" /><Line x1="3" y1="21" x2="10" y2="14" /></G>,
    minimize:       <G {...p}><Polyline points="4 14 10 14 10 20" /><Polyline points="20 10 14 10 14 4" /><Line x1="10" y1="14" x2="3" y2="21" /><Line x1="21" y1="3" x2="14" y2="10" /></G>,
    lock:           <G {...p}><Rect x="3" y="11" width="18" height="11" rx="2" /><Path d="M7 11V7a5 5 0 0 1 10 0v4" /></G>,
    unlock:         <G {...p}><Rect x="3" y="11" width="18" height="11" rx="2" /><Path d="M7 11V7a5 5 0 0 1 9.9-1" /></G>,
    check:          <Polyline points="20 6 9 17 4 12" {...p} />,
    quiz:           <G {...p}><Circle cx="12" cy="12" r="10" /><Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><Line x1="12" y1="17" x2="12.01" y2="17" /></G>,
    flask:          <G stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"><Path d="M9 3h6v8l3.8 7.6A1 1 0 0 1 17.9 21H6.1a1 1 0 0 1-.9-1.4L9 11V3z" /><Line x1="6" y1="3" x2="18" y2="3" /></G>,
    gauge:          <G {...p}><Path d="M12 2a10 10 0 1 0 9.7 7.5" /><Polyline points="20.7 2.1 22 8 16.1 6.3" /><Line x1="12" y1="12" x2="9" y2="9" /></G>,
    'video-file':   <G {...p}><Polygon points="23 7 16 12 23 17 23 7" /><Rect x="1" y="5" width="15" height="14" rx="2" /></G>,
    article:        <G {...p}><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Polyline points="14 2 14 8 20 8" /><Line x1="16" y1="13" x2="8" y2="13" /><Line x1="16" y1="17" x2="8" y2="17" /></G>,
    clock:          <G {...p}><Circle cx="12" cy="12" r="10" /><Polyline points="12 6 12 12 16 14" /></G>,
    star:           <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={filled ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth={sw} strokeLinejoin="round" />,
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24">{nodes[name] ?? null}</Svg>;
};

// ─── Seekbar ────────────────────────────────────────────────────────────────────
interface SeekbarProps {
  pct: number; isFS: boolean; isDragging: boolean;
  panHandlers: any; trackWidth?: number;
}
const Seekbar: React.FC<SeekbarProps> = ({ pct, isFS, isDragging, panHandlers, trackWidth }) => {
  const trackW = trackWidth ?? (isFS ? FS_BAR : BAR_W);
  const pH     = isFS ? 24 : 16;
  const buf    = Math.min(1, pct + 0.12);
  return (
    <View style={[sk.area, { paddingHorizontal: pH }]} {...panHandlers}>
      <View style={[sk.track, { width: trackW }]}>
        <View style={[sk.buf, { width: buf * trackW }]} />
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[sk.played, { width: pct * trackW }]} />
      </View>
      <View style={[sk.thumb, isDragging && sk.thumbBig, { left: pH + pct * trackW - (isDragging ? 12 : 9) }]} />
    </View>
  );
};
const sk = StyleSheet.create({
  area:    { height: 38, justifyContent: 'center' },
  track:   { height: 4, backgroundColor: 'rgba(255,255,255,.20)', borderRadius: 4 },
  buf:     { position: 'absolute', left: 0, top: 0, height: '100%', backgroundColor: 'rgba(255,255,255,.30)', borderRadius: 4 },
  played:  { position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 4 },
  thumb:   { position: 'absolute', top: 9, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, borderWidth: 2.5, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.55, shadowRadius: 6, elevation: 6 },
  thumbBig:{ width: 24, height: 24, borderRadius: 12, top: 6 },
});

// ─── SeekRipple ─────────────────────────────────────────────────────────────────
const SeekRipple: React.FC<{ side: 'left' | 'right'; label: string; anim: Animated.Value }> = ({ side, label, anim }) => {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.4] });
  return (
    <Animated.View pointerEvents="none" style={[rpl.wrap, side === 'left' ? { left: 0 } : { right: 0 }, { opacity: anim }]}>
      <Animated.View style={[rpl.ring, { transform: [{ scale }] }]} />
      <View style={rpl.icons}>
        {side === 'left'
          ? <><Icon name="back" size={20} color="rgba(255,255,255,.9)" sw={2.5} /><Icon name="back" size={20} color="rgba(255,255,255,.45)" sw={2.5} /></>
          : <><Icon name="chevron-right" size={20} color="rgba(255,255,255,.45)" sw={2.5} /><Icon name="chevron-right" size={20} color="rgba(255,255,255,.9)" sw={2.5} /></>}
      </View>
      <Text style={rpl.label}>{label}</Text>
    </Animated.View>
  );
};
const rpl = StyleSheet.create({
  wrap:  { position: 'absolute', top: 0, bottom: 0, width: '44%', alignItems: 'center', justifyContent: 'center' } as any,
  ring:  { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,.10)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,.25)' },
  icons: { flexDirection: 'row', marginBottom: 4 },
  label: { fontSize: 11, color: 'rgba(255,255,255,.88)', fontWeight: '700' },
});

// ─── CircleBtn ──────────────────────────────────────────────────────────────────
const CircleBtn: React.FC<{ onPress: () => void; children: React.ReactNode; style?: any }> = ({ onPress, children, style }) => (
  <TouchableOpacity onPress={onPress} style={[cbb.btn, style]} hitSlop={HIT} activeOpacity={0.75}>
    {children}
  </TouchableOpacity>
);
const cbb = StyleSheet.create({
  btn: { width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(255,255,255,.13)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,.15)' },
});

// ─── SpeedMenu ──────────────────────────────────────────────────────────────────
const SpeedMenu: React.FC<{ speedIdx: number; onSelect: (i: number) => void }> = ({ speedIdx, onSelect }) => (
  <View style={spm.wrap}>
    <LinearGradient colors={[Colors.brand, '#1A0A0C']} style={spm.menu}>
      <View style={spm.hdr}>
        <Icon name="gauge" size={11} color={Colors.primary} sw={2} />
        <Text style={spm.hdrTxt}>PLAYBACK SPEED</Text>
      </View>
      {SPEED_OPTS.map((opt, i) => (
        <TouchableOpacity key={opt.label} style={[spm.row, speedIdx === i && spm.rowOn]} onPress={() => onSelect(i)}>
          <Text style={[spm.rowTxt, speedIdx === i && spm.rowTxtOn]}>{opt.label}</Text>
          {speedIdx === i && <Icon name="check" size={12} color={Colors.primary} sw={2.5} />}
        </TouchableOpacity>
      ))}
    </LinearGradient>
  </View>
);
const spm = StyleSheet.create({
  wrap:     { position: 'absolute', right: 12, top: 48, zIndex: 40 },
  menu:     { borderRadius: 14, borderWidth: 1, borderColor: 'rgba(196,149,96,.35)', minWidth: 160, paddingVertical: 8, overflow: 'hidden' },
  hdr:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingBottom: 8, paddingTop: 4 },
  hdrTxt:   { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 11 },
  rowOn:    { backgroundColor: 'rgba(196,149,96,.12)' },
  rowTxt:   { fontSize: 13, color: 'rgba(255,255,255,.75)', fontWeight: '500' },
  rowTxtOn: { color: Colors.primary, fontWeight: '800' },
});

// ─── Main component ─────────────────────────────────────────────────────────────
export const VideoPlayerScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  // ── Window dimensions — update automatically on rotation ─────────────────
  const { width: winW, height: winH } = useWindowDimensions();
  // fsBarRef lets the fsPan PanResponder (created once) always read the latest
  // landscape seekbar width even after the orientation changes.
  const fsBarRef = useRef(FS_BAR);
  useEffect(() => { fsBarRef.current = Math.max(winW, winH) - 48; }, [winW, winH]);
  // Current seekbar width for fullscreen — recalculated on every render
  const fsBarW = Math.max(winW, winH) - 48;

  // ── Current chapter / topic (initialised from route params) ──────────────
  const [ci, setCi] = useState<number>(route.params?.chapterIdx ?? 0);
  const [ti, setTi] = useState<number>(route.params?.topicIdx   ?? 0);

  // ── Completion map: { "c0": [0,1,2], "c1": [0] } ─────────────────────────
  const [completedMap, setCompletedMap] = useState<Record<string, number[]>>({});
  const markDone = useCallback((chapterIdx: number, topicIdx: number) => {
    setCompletedMap(prev => {
      const key  = `c${chapterIdx}`;
      const list = prev[key] ?? [];
      return list.includes(topicIdx) ? prev : { ...prev, [key]: [...list, topicIdx] };
    });
  }, []);

  // ── Video playback ────────────────────────────────────────────────────────
  const [paused,    setPaused]    = useState(false);
  const [ready,     setReady]     = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [duration,  setDuration]  = useState(0);
  const [current,   setCurrent]   = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [muted,     setMuted]     = useState(false);
  const [speedIdx,  setSpeedIdx]  = useState(2);
  const [topicDone, setTopicDone] = useState(false);

  // ── Seekbar drag ──────────────────────────────────────────────────────────
  const [seeking,  setSeeking]  = useState(false);
  const [seekPct,  setSeekPct]  = useState<number | null>(null);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [ctrlVisible, setCtrlVisible] = useState(true);
  const [showSpeed,   setShowSpeed]   = useState(false);
  const [ripple,      setRipple]      = useState<{ side: 'left' | 'right'; label: string } | null>(null);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const [fullscreen,  setFullscreen]  = useState(false);
  const [fsReady,     setFsReady]     = useState(false);
  const [fsCtrl,      setFsCtrl]      = useState(true);
  const [fsLocked,    setFsLocked]    = useState(false);
  const [fsSeeking,   setFsSeeking]   = useState(false);
  const [fsSeekPct,   setFsSeekPct]   = useState<number | null>(null);
  const [fsRipple,    setFsRipple]    = useState<{ side: 'left' | 'right'; label: string } | null>(null);
  const [fsDuration,  setFsDuration]  = useState(0);
  const [fsCurrent,   setFsCurrent]   = useState(0);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const portRef     = useRef<VideoRef>(null);
  const fsRef       = useRef<VideoRef>(null);
  const savedPos    = useRef(0);
  const durRef      = useRef(0);
  const fsDurRef    = useRef(0);
  const ctrlTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fsCtrlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dtRef       = useRef({ pL: 0, pR: 0, fL: 0, fR: 0 });

  const ctrlAnim   = useRef(new Animated.Value(1)).current;
  const fsCtrlAnim = useRef(new Animated.Value(1)).current;
  const ripAnim    = useRef(new Animated.Value(0)).current;
  const fsRipAnim  = useRef(new Animated.Value(0)).current;

  // ── Derived ───────────────────────────────────────────────────────────────
  const chapter     = CHAPTERS[ci] ?? CHAPTERS[0];
  const topic       = chapter.topics[ti] ?? chapter.topics[0];
  const isLastTopic = ti === chapter.topics.length - 1;
  const isCurDone   = isDone(completedMap, ci, ti) || topicDone;

  // Compute allChDone including the current in-progress topic
  const effectiveMap = topicDone
    ? { ...completedMap, [`c${ci}`]: [...(completedMap[`c${ci}`] ?? []), ti] }
    : completedMap;
  const allChDone   = chAllDone(effectiveMap, ci);

  const hasVideo    = !!(topic.contentUrl && topic.type === 'video');
  const pct         = seekPct   ?? (duration   > 0 ? Math.min(current   / duration,   1) : 0);
  const fsPct       = fsSeekPct ?? (fsDuration > 0 ? Math.min(fsCurrent / fsDuration, 1) : 0);

  // ── Controls helpers ──────────────────────────────────────────────────────
  const clearCtrl = useCallback(() => {
    if (ctrlTimer.current) { clearTimeout(ctrlTimer.current); ctrlTimer.current = null; }
  }, []);
  const clearFs = useCallback(() => {
    if (fsCtrlTimer.current) { clearTimeout(fsCtrlTimer.current); fsCtrlTimer.current = null; }
  }, []);

  const hideCtrl = useCallback(() => {
    clearCtrl();
    Animated.timing(ctrlAnim, { toValue: 0, duration: 260, useNativeDriver: true })
      .start(({ finished }) => { if (finished) setCtrlVisible(false); });
  }, [ctrlAnim, clearCtrl]);

  const showCtrl = useCallback((autohide = true) => {
    clearCtrl();
    setCtrlVisible(true);
    Animated.timing(ctrlAnim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    if (autohide) { ctrlTimer.current = setTimeout(hideCtrl, 4000); }
  }, [ctrlAnim, clearCtrl, hideCtrl]);

  const hideFsCtrl = useCallback(() => {
    clearFs();
    Animated.timing(fsCtrlAnim, { toValue: 0, duration: 260, useNativeDriver: true })
      .start(({ finished }) => { if (finished) setFsCtrl(false); });
  }, [fsCtrlAnim, clearFs]);

  const showFsCtrl = useCallback((autohide = true) => {
    clearFs();
    setFsCtrl(true);
    Animated.timing(fsCtrlAnim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    if (autohide) { fsCtrlTimer.current = setTimeout(hideFsCtrl, 4000); }
  }, [fsCtrlAnim, clearFs, hideFsCtrl]);

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    showCtrl(false);
    loadTimer.current = setTimeout(() => { if (!ready) setError('Video took too long to load.'); }, 15_000);
    return () => { clearCtrl(); clearFs(); if (loadTimer.current) clearTimeout(loadTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready) {
      if (loadTimer.current) { clearTimeout(loadTimer.current); loadTimer.current = null; }
      showCtrl();
    }
  }, [ready]);

  // ── Portrait PanResponder ─────────────────────────────────────────────────
  const portPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: e => {
      clearCtrl(); setSeeking(true);
      setSeekPct(Math.max(0, Math.min(1, (e.nativeEvent.locationX - 16) / BAR_W)));
    },
    onPanResponderMove: e => { setSeekPct(Math.max(0, Math.min(1, (e.nativeEvent.locationX - 16) / BAR_W))); },
    onPanResponderRelease: e => {
      const p = Math.max(0, Math.min(1, (e.nativeEvent.locationX - 16) / BAR_W));
      const t = p * durRef.current;
      portRef.current?.seek(t); setCurrent(t); savedPos.current = t;
      setSeeking(false); setSeekPct(null); showCtrl();
    },
    onPanResponderTerminate: () => { setSeeking(false); setSeekPct(null); },
  })).current;

  // ── Fullscreen PanResponder ───────────────────────────────────────────────
  // Use fsBarRef.current (a mutable ref) so this PanResponder — created once —
  // always reads the current landscape track width after device rotation.
  const fsPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: e => {
      clearFs(); setFsSeeking(true);
      setFsSeekPct(Math.max(0, Math.min(1, (e.nativeEvent.locationX - 24) / fsBarRef.current)));
    },
    onPanResponderMove: e => {
      setFsSeekPct(Math.max(0, Math.min(1, (e.nativeEvent.locationX - 24) / fsBarRef.current)));
    },
    onPanResponderRelease: e => {
      const p = Math.max(0, Math.min(1, (e.nativeEvent.locationX - 24) / fsBarRef.current));
      const t = p * fsDurRef.current;
      fsRef.current?.seek(t); setFsCurrent(t); savedPos.current = t;
      setFsSeeking(false); setFsSeekPct(null); showFsCtrl();
    },
    onPanResponderTerminate: () => { setFsSeeking(false); setFsSeekPct(null); },
  })).current;

  // ── Ripple ────────────────────────────────────────────────────────────────
  const fireRipple = useCallback((side: 'left' | 'right', delta: number, anim: Animated.Value, setter: (v: any) => void) => {
    setter({ side, label: `${Math.abs(delta)}s` });
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(380),
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) setter(null); });
  }, []);

  // ── Seek ──────────────────────────────────────────────────────────────────
  const seekTo = useCallback((t: number) => {
    const c = Math.max(0, Math.min(durRef.current, t));
    portRef.current?.seek(c); setCurrent(c); savedPos.current = c; showCtrl();
  }, [showCtrl]);

  const fsSeekTo = useCallback((t: number) => {
    const c = Math.max(0, Math.min(fsDurRef.current, t));
    fsRef.current?.seek(c); setFsCurrent(c); savedPos.current = c; showFsCtrl();
  }, [showFsCtrl]);

  // ── Double-tap ────────────────────────────────────────────────────────────
  const handleTap = useCallback((side: 'left' | 'right') => {
    const now = Date.now(); const key = side === 'left' ? 'pL' : 'pR';
    if (now - dtRef.current[key] < 300) {
      dtRef.current[key] = 0;
      const d = side === 'left' ? -10 : 10;
      seekTo(savedPos.current + d); fireRipple(side, d, ripAnim, setRipple);
    } else {
      dtRef.current[key] = now;
      ctrlVisible ? hideCtrl() : showCtrl();
    }
  }, [ctrlVisible, seekTo, fireRipple, ripAnim, showCtrl, hideCtrl]);

  const handleFsTap = useCallback((side: 'left' | 'right') => {
    if (fsLocked) return;
    const now = Date.now(); const key = side === 'left' ? 'fL' : 'fR';
    if (now - dtRef.current[key] < 300) {
      dtRef.current[key] = 0;
      const d = side === 'left' ? -10 : 10;
      fsSeekTo(savedPos.current + d); fireRipple(side, d, fsRipAnim, setFsRipple);
    } else {
      dtRef.current[key] = now;
      fsCtrl ? hideFsCtrl() : showFsCtrl();
    }
  }, [fsLocked, fsCtrl, fsSeekTo, fireRipple, fsRipAnim, showFsCtrl, hideFsCtrl]);

  // ── Video callbacks (portrait) ────────────────────────────────────────────
  const onLoad = useCallback((data: OnLoadData) => {
    // onLoad fires reliably on both iOS and Android — use it as the primary
    // ready signal. onReadyForDisplay is unreliable on some Android versions
    // and may never fire, leaving the spinner permanently visible.
    durRef.current = data.duration;
    setDuration(data.duration);
    setReady(true);
    setError(null);
    setPaused(false);
    if (loadTimer.current) { clearTimeout(loadTimer.current); loadTimer.current = null; }
  }, []);

  // onReadyForDisplay is iOS-only insurance — onLoad already covers this.
  const onReadyForDisplay = useCallback(() => { setReady(true); setError(null); }, []);

  const onProgress = useCallback((data: OnProgressData) => {
    if (!seeking) { setCurrent(data.currentTime); savedPos.current = data.currentTime; }
    if (buffering) setBuffering(false);
    // Auto-complete at 90%
    if (!topicDone && !isDone(completedMap, ci, ti) && durRef.current > 0 && data.currentTime / durRef.current > 0.9) {
      setTopicDone(true); markDone(ci, ti);
    }
  }, [seeking, buffering, topicDone, completedMap, ci, ti, markDone]);

  const onBuffer = useCallback((data: OnBufferData) => { setBuffering(data.isBuffering); }, []);

  const onError = useCallback((data: OnVideoErrorData) => {
    // v6 uses errorString, not localizedDescription
    const msg = data.error?.errorString ?? 'Could not load video. Check the file path or format.';
    setError(msg); setReady(false); setPaused(true);
    if (loadTimer.current) { clearTimeout(loadTimer.current); loadTimer.current = null; }
  }, []);

  const onEnd = useCallback(() => {
    setPaused(true); setCurrent(duration); showCtrl(false);
    if (!topicDone) { setTopicDone(true); markDone(ci, ti); }
  }, [duration, showCtrl, topicDone, markDone, ci, ti]);

  // ── Video callbacks (fullscreen) ──────────────────────────────────────────
  const onFsLoad = useCallback((data: OnLoadData) => {
    fsDurRef.current = data.duration;
    setFsDuration(data.duration);
    setFsReady(true);   // same fix — don't wait for onReadyForDisplay in fullscreen
    fsRef.current?.seek(savedPos.current);
    setFsCurrent(savedPos.current);
    setPaused(false);
    showFsCtrl();
  }, [showFsCtrl]);
  const onFsReady = useCallback(() => { setFsReady(true); showFsCtrl(); }, [showFsCtrl]);
  const onFsProgress = useCallback((data: OnProgressData) => {
    if (!fsSeeking) { setFsCurrent(data.currentTime); savedPos.current = data.currentTime; }
  }, [fsSeeking]);
  const onFsBuffer   = useCallback((data: OnBufferData) => { setBuffering(data.isBuffering); }, []);

  // ── Fullscreen enter / exit (YouTube-style) ──────────────────────────────
  const enterFS = useCallback(() => {
    setPaused(true); setFsReady(false); setFsCtrl(true);
    fsCtrlAnim.setValue(1); setFsLocked(false);
    if (Platform.OS === 'android') {
      OrientationModule?.lockToLandscape?.();      // rotate device to landscape
      OrientationModule?.enterImmersiveMode?.();   // hide status bar + nav bar → true edge-to-edge
    }
    StatusBar.setHidden(true, 'fade');
    setFullscreen(true);
  }, [fsCtrlAnim]);

  const exitFS = useCallback(() => {
    setFullscreen(false); clearFs();
    if (Platform.OS === 'android') {
      OrientationModule?.unlockAllOrientations?.();
      OrientationModule?.exitImmersiveMode?.();    // restore system bars
    }
    StatusBar.setHidden(false, 'fade');
    setTimeout(() => {
      portRef.current?.seek(savedPos.current); setCurrent(savedPos.current); setPaused(false); showCtrl();
    }, 150);
  }, [clearFs, showCtrl]);

  // ── Topic switching ───────────────────────────────────────────────────────
  const switchTopic = useCallback((newCi: number, newTi: number) => {
    const newTopic      = CHAPTERS[newCi]?.topics[newTi];
    const newHasVideo   = !!(newTopic?.contentUrl && newTopic?.type === 'video');

    setCi(newCi); setTi(newTi);
    setPaused(false); setReady(false); setError(null);
    setTopicDone(false); setCurrent(0); setDuration(0);
    savedPos.current = 0; durRef.current = 0;
    showCtrl(false);
    if (loadTimer.current) clearTimeout(loadTimer.current);
    // Only arm the safety timer for topics that actually have a video to load
    if (newHasVideo) {
      loadTimer.current = setTimeout(() => { setError('Video took too long to load.'); }, 15_000);
    }
  }, [showCtrl]);

  const handleFinish = useCallback(() => {
    if (!topicDone) { setTopicDone(true); markDone(ci, ti); }
    setPaused(true); showCtrl(false);
  }, [topicDone, markDone, ci, ti, showCtrl]);

  const goNext = useCallback(() => {
    if (isLastTopic) {
      navigation.navigate('QuizActive', {});
    } else {
      switchTopic(ci, ti + 1);
    }
  }, [isLastTopic, navigation, ci, ti, switchTopic]);

  // (fullscreen overlay is rendered inline in the return below)

  // ═══════════════════════════════════════════════════════════════════════════
  // PORTRAIT LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Video player ─────────────────────────────────────────────── */}
      <View style={[s.playerBox, { width: winW, height: Math.round(winW * (9 / 16)) }]}>
        {hasVideo ? (
          <Video ref={portRef} source={{ uri: topic.contentUrl! }} style={StyleSheet.absoluteFill}
            resizeMode="contain" paused={paused || fullscreen} muted={muted}
            rate={SPEED_OPTS[speedIdx].value} onLoad={onLoad} onReadyForDisplay={onReadyForDisplay}
            onProgress={onProgress} onBuffer={onBuffer} onError={onError} onEnd={onEnd}
            progressUpdateInterval={250} />
        ) : (
          <View style={s.noVideoBox}>
            <Icon name={topic.type === 'article' ? 'article' : 'video-file'} size={40} color="rgba(255,255,255,.20)" sw={1.5} />
            <Text style={s.noVideoTxt}>
              {topic.type === 'article' ? 'Article' : 'Video not uploaded yet'}
            </Text>
          </View>
        )}

        {/* Spinner */}
        {hasVideo && !ready && !error && (
          <View style={s.spinnerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={s.spinnerTxt}>Loading…</Text>
          </View>
        )}

        {/* Error */}
        {/* Error — only shown when a video was expected but failed to load */}
        {hasVideo && error && (
          <View style={s.errorBox}>
            <Icon name="close" size={30} color={Colors.danger} sw={2.5} />
            <Text style={s.errorTitle}>Playback Error</Text>
            <Text style={s.errorMsg}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => {
              setError(null); setReady(false); setPaused(false);
              if (loadTimer.current) clearTimeout(loadTimer.current);
              loadTimer.current = setTimeout(() => setError('Still unable to load. Check the file.'), 15_000);
            }}>
              <Icon name="replay10" size={15} color={Colors.brand} sw={2} />
              <Text style={s.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Buffer ring */}
        {ready && buffering && (
          <View style={s.bufferOverlay}><ActivityIndicator size="small" color={Colors.primary} /></View>
        )}

        {/* Double-tap zones */}
        <TouchableWithoutFeedback onPress={() => handleTap('left')}><View style={s.tapL} /></TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => handleTap('right')}><View style={s.tapR} /></TouchableWithoutFeedback>
        {ripple && <SeekRipple side={ripple.side} label={ripple.label} anim={ripAnim} />}

        {/* Controls overlay */}
        <Animated.View style={[s.ctrlOverlay, { opacity: ctrlAnim }]} pointerEvents={ctrlVisible ? 'box-none' : 'none'}>

          {/* ── Top bar ── title + back + topic counter */}
          <LinearGradient colors={['rgba(0,0,0,.92)', 'rgba(0,0,0,.44)', 'transparent']} style={s.topGrad} pointerEvents="box-none">
            <SafeAreaView edges={['top']} pointerEvents="box-none">
              <View style={s.topRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={HIT} activeOpacity={0.75}>
                  <Icon name="back" size={20} color="#fff" sw={2} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={s.topSub} numberOfLines={1}>Ch.{ci + 1} · {chapter.title}</Text>
                  <Text style={s.topTitle} numberOfLines={1}>{topic.title}</Text>
                </View>
                <View style={s.topBadge}>
                  <Text style={s.topBadgeTxt}>{ti + 1} / {chapter.topics.length}</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {/* ── Center transport — YouTube-style (no labels, just icons) ── */}
          <View style={s.centerRow} pointerEvents="box-none">
            <TouchableOpacity onPress={() => { seekTo(savedPos.current - 10); showCtrl(); }} hitSlop={HIT} activeOpacity={0.7}>
              <Icon name="replay10" size={38} color="rgba(255,255,255,.92)" sw={1.8} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setPaused(v => !v); showCtrl(); }} style={s.ytPlayBtn} activeOpacity={0.85}>
              <Icon name={paused ? 'play' : 'pause'} size={36} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { seekTo(savedPos.current + 10); showCtrl(); }} hitSlop={HIT} activeOpacity={0.7}>
              <Icon name="forward10" size={38} color="rgba(255,255,255,.92)" sw={1.8} />
            </TouchableOpacity>
          </View>

          {/* ── Bottom — seekbar → YouTube controls row ── */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,.55)', 'rgba(0,0,0,.96)']} style={s.botGrad} pointerEvents="box-none">
            {/* Seekbar (full width) */}
            <Seekbar pct={pct} isFS={false} isDragging={seeking} panHandlers={portPan.panHandlers} />
            {/* YouTube-style controls bar: time | ··· | volume | speed | fullscreen */}
            <View style={s.ytBar}>
              <Text style={s.ytCurTime}>{fmt(current)}</Text>
              <Text style={s.ytSep}> / </Text>
              <Text style={s.ytTotTime}>{fmt(duration || topic.durationMins * 60)}</Text>
              {isCurDone && (
                <View style={s.donePill}>
                  <Icon name="check" size={8} color="#fff" sw={2.5} />
                  <Text style={s.donePillTxt}>Done</Text>
                </View>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setMuted(m => !m)} style={s.ytIconBtn} hitSlop={HIT} activeOpacity={0.75}>
                <Icon name={muted ? 'volume-off' : 'volume-on'} size={18} color="rgba(255,255,255,.88)" sw={1.8} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowSpeed(v => !v); clearCtrl(); }} style={s.ytSpeedBtn} hitSlop={HIT} activeOpacity={0.75}>
                <Text style={s.ytSpeedTxt}>{SPEED_OPTS[speedIdx].label}</Text>
              </TouchableOpacity>
              {hasVideo && (
                <TouchableOpacity onPress={enterFS} style={s.ytMaxBtn} hitSlop={HIT} activeOpacity={0.75}>
                  <Icon name="maximize" size={18} color="rgba(255,255,255,.88)" sw={1.8} />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {showSpeed && <SpeedMenu speedIdx={speedIdx} onSelect={i => { setSpeedIdx(i); setShowSpeed(false); showCtrl(); }} />}
        </Animated.View>
      </View>

      {/* ══════════════════════════════════════════════════════════════════
          YOUTUBE-STYLE FULLSCREEN OVERLAY
          Absolute over the entire screen. OrientationModule.lockToLandscape()
          rotates the device; useWindowDimensions gives live landscape dims.
          No Modal needed — avoids Android's orientation quirks entirely.
      ══════════════════════════════════════════════════════════════════ */}
      {fullscreen && topic.contentUrl && (
        <View style={fss.root}>
          {/* Video — fills the rotated landscape screen edge-to-edge */}
          <Video
            ref={fsRef}
            source={{ uri: topic.contentUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            paused={paused}
            muted={muted}
            rate={SPEED_OPTS[speedIdx].value}
            onLoad={onFsLoad}
            onReadyForDisplay={onFsReady}
            onProgress={onFsProgress}
            onBuffer={onFsBuffer}
            onEnd={() => { setPaused(true); setFsCurrent(fsDuration); showFsCtrl(false); }}
            onError={() => {}}
            progressUpdateInterval={250}
          />

          {/* Loading spinner */}
          {!fsReady && (
            <View style={fss.spinner}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          )}

          {/* Lock badge */}
          {fsLocked ? (
            <TouchableOpacity
              style={fss.lockOverlay as any}
              onPress={() => setFsLocked(false)}
              activeOpacity={1}
            >
              <View style={fss.lockBadge}>
                <Icon name="lock" size={18} color="rgba(255,255,255,.85)" sw={2} />
                <Text style={fss.lockTxt}>Tap to unlock</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <>
              {/* Double-tap seek zones */}
              <TouchableWithoutFeedback onPress={() => handleFsTap('left')}>
                <View style={fss.tapL} />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => handleFsTap('right')}>
                <View style={fss.tapR} />
              </TouchableWithoutFeedback>

              {fsRipple && (
                <SeekRipple side={fsRipple.side} label={fsRipple.label} anim={fsRipAnim} />
              )}

              {/* Controls overlay */}
              <Animated.View
                style={[fss.ctrlOverlay, { opacity: fsCtrlAnim }]}
                pointerEvents={fsCtrl ? 'box-none' : 'none'}
              >
                {/* ── Top bar ── */}
                <LinearGradient
                  colors={['rgba(0,0,0,.95)', 'rgba(0,0,0,.50)', 'transparent']}
                  style={fss.topGrad}
                  pointerEvents="box-none"
                >
                  <View style={fss.topRow}>
                    <CircleBtn onPress={exitFS}>
                      <Icon name="chevron-down" size={19} color="#fff" sw={2.5} />
                    </CircleBtn>
                    <View style={{ flex: 1 }}>
                      <Text style={fss.subjectTxt}>{COURSE.subject.toUpperCase()}</Text>
                      <Text style={fss.titleTxt} numberOfLines={1}>{topic.title}</Text>
                    </View>
                    <View style={fss.topRight}>
                      <CircleBtn onPress={() => setMuted(m => !m)}>
                        <Icon name={muted ? 'volume-off' : 'volume-on'} size={17} color="#fff" sw={2} />
                      </CircleBtn>
                      <TouchableOpacity
                        onPress={() => { setShowSpeed(v => !v); clearFs(); }}
                        style={fss.speedPill} hitSlop={HIT}
                      >
                        <Icon name="gauge" size={11} color={Colors.primary} sw={2} />
                        <Text style={fss.speedTxt}>{SPEED_OPTS[speedIdx].label}</Text>
                      </TouchableOpacity>
                      <CircleBtn onPress={() => { setFsLocked(true); clearFs(); }}>
                        <Icon name="unlock" size={16} color="#fff" sw={2} />
                      </CircleBtn>
                    </View>
                  </View>
                </LinearGradient>

                {/* ── Center transport (YouTube-style, icon-only) ── */}
                <View style={fss.centerRow} pointerEvents="box-none">
                  <TouchableOpacity
                    onPress={() => { fsSeekTo(savedPos.current - 10); showFsCtrl(); }}
                    hitSlop={HIT} activeOpacity={0.7}
                  >
                    <Icon name="replay10" size={42} color="rgba(255,255,255,.92)" sw={1.8} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setPaused(v => !v); showFsCtrl(); }}
                    style={fss.playBtn} activeOpacity={0.85}
                  >
                    <Icon name={paused ? 'play' : 'pause'} size={40} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { fsSeekTo(savedPos.current + 10); showFsCtrl(); }}
                    hitSlop={HIT} activeOpacity={0.7}
                  >
                    <Icon name="forward10" size={42} color="rgba(255,255,255,.92)" sw={1.8} />
                  </TouchableOpacity>
                </View>

                {/* ── Bottom: seekbar → YouTube controls row ── */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,.60)', 'rgba(0,0,0,.96)']}
                  style={fss.botGrad}
                  pointerEvents="box-none"
                >
                  <Seekbar
                    pct={fsPct}
                    isFS
                    isDragging={fsSeeking}
                    panHandlers={fsPan.panHandlers}
                    trackWidth={fsBarW}
                  />
                  <View style={fss.ytBar}>
                    <Text style={fss.ytCurTime}>{fmt(fsCurrent)}</Text>
                    <Text style={fss.ytSep}> / </Text>
                    <Text style={fss.ytTotTime}>{fmt(fsDuration)}</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={exitFS} style={fss.miniBtn} hitSlop={HIT} activeOpacity={0.75}>
                      <Icon name="minimize" size={20} color="rgba(255,255,255,.85)" sw={1.8} />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>

                {showSpeed && (
                  <SpeedMenu
                    speedIdx={speedIdx}
                    onSelect={i => { setSpeedIdx(i); setShowSpeed(false); showFsCtrl(); }}
                  />
                )}
              </Animated.View>
            </>
          )}
        </View>
      )}

      {/* ── Chapter tabs ──────────────────────────────────────────────── */}
      <View style={s.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsContent}>
          {CHAPTERS.map((ch, idx) => {
            const allDone  = chAllDone(effectiveMap, idx);
            const isCurrent = idx === ci;
            return (
              <TouchableOpacity key={idx} onPress={() => switchTopic(idx, 0)}
                style={[s.chTab, isCurrent && s.chTabActive]} activeOpacity={0.75}>
                {allDone
                  ? <View style={s.chTabCheck}><Icon name="check" size={9} color="#fff" sw={2.5} /></View>
                  : <Text style={[s.chTabNum, isCurrent && s.chTabNumActive]}>{idx + 1}</Text>}
                <Text style={[s.chTabTxt, isCurrent && s.chTabTxtActive]} numberOfLines={1}>{ch.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Quiz unlock banner ────────────────────────────────────────── */}
      {isCurDone && allChDone && isLastTopic && (
        <LinearGradient colors={[Colors.brand, Colors.brandMid]} style={s.quizBanner}>
          <View style={s.quizBannerIcon}>
            <Icon name="quiz" size={20} color={Colors.primary} sw={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.quizBannerTitle}>Chapter Quiz Unlocked</Text>
            <Text style={s.quizBannerSub}>All topics in {chapter.title} complete</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('QuizActive', {})} style={s.quizBannerBtn} activeOpacity={0.85}>
            <Text style={s.quizBannerBtnTxt}>Start Quiz</Text>
            <Icon name="chevron-right" size={13} color={Colors.brand} sw={2.5} />
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* ── Topic list ────────────────────────────────────────────────── */}
      <SafeAreaView style={s.panel} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.listContent}>

          <View style={s.listHdr}>
            <Icon name="flask" size={13} color={Colors.primary} sw={2} />
            <Text style={s.listHdrTxt}>Ch.{ci + 1} — {chapter.title}</Text>
            <Text style={s.listCount}>{chapter.topics.length} topics</Text>
          </View>

          {chapter.topics.map((t, idx) => {
            const tDone    = isDone(effectiveMap, ci, idx);
            const isCur    = idx === ti;
            const prevDone = idx === 0 || isDone(effectiveMap, ci, idx - 1);
            const locked   = !isCur && !tDone && !prevDone;

            return (
              <TouchableOpacity key={t.id}
                onPress={() => !locked && switchTopic(ci, idx)}
                style={[s.topicItem, isCur && s.topicCur, tDone && !isCur && s.topicDone, locked && s.topicLocked]}
                activeOpacity={locked ? 1 : 0.8}>
                <View style={[s.node, tDone ? s.nodeGreen : isCur ? s.nodeGold : locked ? s.nodeLocked : s.nodeDefault]}>
                  {tDone   ? <Icon name="check" size={13} color="#fff" sw={2.5} />
                   : isCur  ? <Icon name="play" size={11} color={Colors.brand} />
                   : locked ? <Icon name="lock" size={11} color={Colors.text3} sw={2} />
                   : <Text style={s.nodeNum}>{idx + 1}</Text>}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[s.topicTitle, isCur && s.topicTitleCur, tDone && !isCur && s.topicTitleDone, locked && s.topicTitleLocked]}
                    numberOfLines={1}>{t.title}</Text>
                  <View style={s.topicMeta}>
                    <Icon name={t.type === 'video' ? 'video-file' : 'article'} size={10} color={Colors.text3} sw={1.8} />
                    <Text style={s.topicDur}>{fmtDur(t.durationMins)}</Text>
                  </View>
                </View>
                {tDone && !isCur && <View style={s.doneBadge}><Text style={s.doneBadgeTxt}>Done</Text></View>}
                {isCur && <View style={s.playingBadge}><Icon name="play" size={7} color={Colors.brand} /><Text style={s.playingBadgeTxt}>Playing</Text></View>}
                {locked && <Icon name="lock" size={13} color={Colors.border} sw={1.5} />}
              </TouchableOpacity>
            );
          })}

          {/* Quiz row */}
          <TouchableOpacity
            onPress={() => allChDone ? navigation.navigate('QuizActive', {}) : undefined}
            style={[s.quizItem, allChDone ? s.quizOn : s.quizOff]}
            activeOpacity={allChDone ? 0.8 : 1}>
            <View style={[s.quizNode, allChDone ? s.quizNodeOn : s.quizNodeOff]}>
              <Icon name="quiz" size={15} color={allChDone ? Colors.primary : Colors.text3} sw={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.quizTitle, !allChDone && s.quizTitleOff]}>Chapter Quiz</Text>
              <Text style={s.quizSub}>{allChDone ? 'Ready to attempt' : 'Complete all topics to unlock'}</Text>
            </View>
            {allChDone
              ? <View style={s.quizArrow}><Icon name="chevron-right" size={15} color={Colors.primary} sw={2.5} /></View>
              : <Icon name="lock" size={14} color={Colors.border} sw={1.5} />}
          </TouchableOpacity>

          <View style={{ height: 8 }} />
        </ScrollView>

        {/* ── Bottom action bar ─────────────────────────────────────── */}
        <View style={s.bottomBar}>
          {isCurDone ? (
            <TouchableOpacity onPress={goNext} style={s.nextBtn} activeOpacity={0.85}>
              <Text style={s.nextBtnTxt} numberOfLines={1}>
                {isLastTopic ? 'Take Chapter Quiz' : `Next: ${chapter.topics[ti + 1]?.title}`}
              </Text>
              <Icon name={isLastTopic ? 'quiz' : 'chevron-right'} size={16} color={Colors.brand} sw={2.5} />
            </TouchableOpacity>
          ) : hasVideo ? (
            <View style={s.playBar}>
              <TouchableOpacity onPress={() => setPaused(v => !v)} style={s.playBarBtn} activeOpacity={0.85}>
                <Icon name={paused ? 'play' : 'pause'} size={20} color={Colors.brand} />
                <Text style={s.playBarTxt}>{paused ? 'Resume' : 'Playing'}</Text>
              </TouchableOpacity>
              <View style={s.playBarDiv} />
              <TouchableOpacity onPress={handleFinish} style={s.markDoneBtn} activeOpacity={0.8}>
                <Icon name="check" size={16} color={Colors.primary} sw={2.5} />
                <Text style={s.markDoneTxt}>Mark Done</Text>
              </TouchableOpacity>
            </View>
          ) : topic.type === 'article' ? (
            <TouchableOpacity onPress={handleFinish} style={s.nextBtn} activeOpacity={0.85}>
              <Icon name="check" size={16} color={Colors.brand} sw={2.5} />
              <Text style={s.nextBtnTxt}>Mark as Read</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.unavailBar}>
              <Icon name="clock" size={14} color={Colors.text3} sw={2} />
              <Text style={s.unavailTxt}>Video not uploaded yet</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

// ─── Fullscreen styles ──────────────────────────────────────────────────────────
const fss = StyleSheet.create({
  // ── Overlay: absolute over the entire screen ───────────────────────────────
  // OrientationModule.lockToLandscape() rotates the device; enterImmersiveMode()
  // hides both status bar and navigation bar → true edge-to-edge like YouTube.
  root: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000', zIndex: 9999, elevation: 9999,
  },

  // ── Spinner / tap zones / lock ─────────────────────────────────────────────
  spinner:     { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  ctrlOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'space-between' },
  tapL:        { position: 'absolute', left: 0, top: 0, bottom: 0, width: '42%' },
  tapR:        { position: 'absolute', right: 0, top: 0, bottom: 0, width: '42%' },
  lockOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.45)' },
  lockBadge:   {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 24, paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,.80)', borderRadius: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,.18)',
  },
  lockTxt:     { fontSize: 14, color: 'rgba(255,255,255,.90)', fontWeight: '600' },

  // ── Top gradient + bar ─────────────────────────────────────────────────────
  topGrad:     { paddingBottom: 28 },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 18 },
  topRight:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subjectTxt:  { fontSize: 10, color: Colors.primary, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  titleTxt:    { fontSize: 15, color: '#fff', fontWeight: '700', letterSpacing: -0.2 },
  speedPill:   {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: 'rgba(196,149,96,.14)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(196,149,96,.38)',
  },
  speedTxt:    { fontSize: 12, fontWeight: '800', color: Colors.primary },

  // ── Center transport ───────────────────────────────────────────────────────
  centerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 64 },
  // Semi-transparent circle — YouTube's characteristic play button style
  playBtn:     {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(0,0,0,.50)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,.28)',
  },

  // ── Bottom gradient + YouTube controls row ─────────────────────────────────
  botGrad:     { paddingTop: 0, paddingBottom: 4 },
  // Row: [current] / [total]  ···spacer···  [minimize]
  ytBar:       {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 22, paddingBottom: 14, marginTop: 2, gap: 5,
  },
  ytCurTime:   { fontSize: 13, color: '#fff',                  fontWeight: '700', fontVariant: ['tabular-nums'] },
  ytSep:       { fontSize: 12, color: 'rgba(255,255,255,.42)' },
  ytTotTime:   { fontSize: 12, color: 'rgba(255,255,255,.42)', fontWeight: '500', fontVariant: ['tabular-nums'] },
  // Minimize (exit fullscreen) button — no background, just the icon
  miniBtn:     { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
});

// ─── Portrait styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: Colors.bg },
  playerBox:   { backgroundColor: '#000' }, // width/height applied inline via useWindowDimensions

  noVideoBox:  { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 10 },
  noVideoTxt:  { fontSize: 12, color: 'rgba(255,255,255,.35)', fontWeight: '600' },

  spinnerBox:  { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.70)', gap: 10 },
  spinnerTxt:  { color: Colors.primary, fontSize: 12, fontWeight: '600' },

  errorBox:    { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.88)', padding: 24, gap: 10 },
  errorTitle:  { fontSize: 15, fontWeight: '800', color: '#fff' },
  errorMsg:    { fontSize: 11, color: 'rgba(255,255,255,.60)', textAlign: 'center', lineHeight: 17 },
  retryBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 22 },
  retryTxt:    { fontSize: 13, fontWeight: '800', color: Colors.brand },

  bufferOverlay:{ position: 'absolute', alignSelf: 'center', top: '50%', marginTop: -16 },
  tapL:        { position: 'absolute', left: 0, top: 0, bottom: 0, width: '42%' },
  tapR:        { position: 'absolute', right: 0, top: 0, bottom: 0, width: '42%' },
  ctrlOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'space-between' },

  // ── Player controls (YouTube-style) ──
  topGrad:     { paddingBottom: 16 },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 6 },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topSub:      { fontSize: 8, color: Colors.primary, fontWeight: '700', letterSpacing: 0.8 },
  topTitle:    { fontSize: 11, color: '#fff', fontWeight: '700', marginTop: 1 },
  topBadge:    { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,.20)' },
  topBadgeTxt: { fontSize: 9, color: 'rgba(255,255,255,.80)', fontWeight: '700' },

  centerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  ytPlayBtn:   { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,0,0,.40)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,.30)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10 },

  botGrad:     { paddingTop: 0 },
  ytBar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, marginTop: 0, gap: 4 },
  ytCurTime:   { fontSize: 12, color: '#fff', fontWeight: '700', fontVariant: ['tabular-nums'] },
  ytSep:       { fontSize: 11, color: 'rgba(255,255,255,.45)' },
  ytTotTime:   { fontSize: 11, color: 'rgba(255,255,255,.45)', fontWeight: '500', fontVariant: ['tabular-nums'] },
  donePill:    { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: Colors.success, borderRadius: 8 },
  donePillTxt: { fontSize: 8, fontWeight: '800', color: '#fff' },
  ytIconBtn:   { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  ytSpeedBtn:  { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(196,149,96,.18)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(196,149,96,.40)' },
  ytSpeedTxt:  { fontSize: 10, fontWeight: '800', color: Colors.primary },
  ytMaxBtn:    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  // Chapter tabs
  tabsWrap:      { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  tabsContent:   { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chTab:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.bg2, borderWidth: 1.5, borderColor: 'transparent', flexShrink: 0 },
  chTabActive:   { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chTabNum:      { fontSize: 10, fontWeight: '800', color: Colors.text3, minWidth: 14, textAlign: 'center' },
  chTabNumActive:{ color: Colors.primary },
  chTabTxt:      { fontSize: 11, fontWeight: '600', color: Colors.text3, maxWidth: 90 },
  chTabTxtActive:{ color: Colors.primary, fontWeight: '800' },
  chTabCheck:    { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },

  // Quiz unlock banner
  quizBanner:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 11 },
  quizBannerIcon:  { width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(196,149,96,.14)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(196,149,96,.25)' },
  quizBannerTitle: { fontSize: 12, fontWeight: '800', color: '#F5E8D0' },
  quizBannerSub:   { fontSize: 10, color: 'rgba(245,232,208,.60)', marginTop: 1 },
  quizBannerBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: 20 },
  quizBannerBtnTxt:{ fontSize: 11, fontWeight: '800', color: Colors.brand },

  // Content panel
  panel:         { flex: 1, backgroundColor: Colors.bg },
  listContent:   { padding: 14, gap: 8 },
  listHdr:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  listHdrTxt:    { flex: 1, fontSize: 12, fontWeight: '800', color: Colors.text, letterSpacing: 0.1 },
  listCount:     { fontSize: 10, fontWeight: '600', color: Colors.text3 },

  // Topic rows
  topicItem:     { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border2, padding: 11, paddingHorizontal: 13, ...Shadow.sm },
  topicCur:      { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  topicDone:     { borderColor: `${Colors.success}30` },
  topicLocked:   { opacity: 0.5 },

  node:          { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nodeGreen:     { backgroundColor: Colors.success },
  nodeGold:      { backgroundColor: Colors.primary },
  nodeLocked:    { backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border },
  nodeDefault:   { backgroundColor: Colors.bg2 },
  nodeNum:       { fontSize: 11, fontWeight: '700', color: Colors.text3 },

  topicTitle:      { fontSize: 12, fontWeight: '600', color: Colors.text },
  topicTitleCur:   { color: Colors.primary, fontWeight: '700' },
  topicTitleDone:  { color: Colors.success },
  topicTitleLocked:{ color: Colors.text3 },
  topicMeta:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  topicDur:        { fontSize: 10, color: Colors.text3 },

  doneBadge:       { paddingHorizontal: 7, paddingVertical: 3, backgroundColor: Colors.successLight, borderRadius: 8 },
  doneBadgeTxt:    { fontSize: 9, fontWeight: '700', color: Colors.success },
  playingBadge:    { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: Colors.primary, borderRadius: 8 },
  playingBadgeTxt: { fontSize: 9, fontWeight: '800', color: Colors.brand },

  // Quiz row
  quizItem:     { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: Radius.md, padding: 11, paddingHorizontal: 13, borderWidth: 1.5, marginTop: 4 },
  quizOn:       { backgroundColor: Colors.primaryLight, borderColor: `${Colors.primary}55` },
  quizOff:      { backgroundColor: Colors.bg2, borderColor: Colors.border2, opacity: 0.6 },
  quizNode:     { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  quizNodeOn:   { backgroundColor: 'rgba(196,149,96,.15)' },
  quizNodeOff:  { backgroundColor: Colors.bg2 },
  quizTitle:    { fontSize: 12, fontWeight: '700', color: Colors.primary },
  quizTitleOff: { color: Colors.text3 },
  quizSub:      { fontSize: 10, color: Colors.text3, marginTop: 1 },
  quizArrow:    { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },

  // Bottom bar
  bottomBar:    { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border2, padding: 10, paddingBottom: 14 },
  nextBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20 },
  nextBtnTxt:   { flex: 1, fontSize: 13, fontWeight: '900', color: Colors.brand, textAlign: 'center' },
  playBar:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border2 },
  playBarBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, backgroundColor: Colors.primary },
  playBarTxt:   { fontSize: 13, fontWeight: '800', color: Colors.brand },
  playBarDiv:   { width: 1, height: 46, backgroundColor: `${Colors.brand}18` },
  markDoneBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
  markDoneTxt:  { fontSize: 13, fontWeight: '700', color: Colors.primary },
  unavailBar:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: Colors.bg2, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: Colors.border2 },
  unavailTxt:   { fontSize: 12, fontWeight: '600', color: Colors.text3 },
});
