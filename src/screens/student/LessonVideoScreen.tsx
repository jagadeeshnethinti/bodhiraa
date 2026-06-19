import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  ActivityIndicator,
  PanResponder,
  ScrollView,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import Video, { type VideoRef, type OnLoadData, type OnProgressData } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Orientation from 'react-native-orientation-locker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { StudentApi } from '../../api';
import { Icon } from '../../components/common/Icon';
import { Entrance, PressableScale } from '../../components/common/anim';
import { useApi } from '../../hooks/useApi';

type Props = NativeStackScreenProps<StudentStackParamList, 'LessonVideo'>;

// Bundled lesson video (plays offline). Swap this file (keep the name) to change it.
const LOCAL_LESSON_VIDEO = require('../../assets/videos/rexy.mp4');

const fmt = (s: number): string => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const PROGRESS_POST_INTERVAL = 10;
const COMPLETE_THRESHOLD = 0.9;
const SPEEDS = [1, 1.25, 1.5, 2, 0.75];

export const LessonVideoScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId, title, subjectName } = route.params;
  const { width: winW } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const playerH = Math.round(winW * (9 / 16));

  // Use the bundled video so it plays without a network connection.
  const source = LOCAL_LESSON_VIDEO;
  const lesson = useApi(signal => StudentApi.lesson(lessonId, signal), [lessonId]);
  const upNext = (lesson.data?.siblings ?? []).find(s => s.id !== lessonId) ?? null;

  const ref = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controls, setControls] = useState(true);
  const [rate, setRate] = useState(1);
  const [done, setDone] = useState(false);

  const lastPostedAt = useRef(0);
  const completedPosted = useRef(false);
  const currentRef = useRef(0);
  const durationRef = useRef(0);

  const postProgress = useCallback(
    (seconds: number, completed: boolean) => {
      StudentApi.postProgress(lessonId, { watched_seconds: Math.max(0, Math.floor(seconds)), completed }).catch(() => {});
    },
    [lessonId],
  );

  useEffect(
    () => () => {
      if (!completedPosted.current && currentRef.current > lastPostedAt.current + 2) {
        postProgress(currentRef.current, false);
      }
    },
    [postProgress],
  );

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showControls = useCallback((autoHide = true) => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (autoHide) hideTimer.current = setTimeout(() => setControls(false), 3500);
  }, []);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showControls]);

  // ── Custom landscape fullscreen (keeps our own controls) ───────────────────
  const enterFullscreen = useCallback(() => {
    setFullscreen(true);
    Orientation.lockToLandscape();
    showControls();
  }, [showControls]);
  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    Orientation.lockToPortrait();
    showControls();
  }, [showControls]);
  const toggleFullscreen = () => (fullscreen ? exitFullscreen() : enterFullscreen());

  // Restore portrait when leaving the screen.
  useEffect(() => () => { Orientation.lockToPortrait(); }, []);

  // Hardware back exits fullscreen first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (fullscreen) {
        exitFullscreen();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [fullscreen, exitFullscreen]);

  const trackW = useRef(1);
  const [seeking, setSeeking] = useState(false);
  const [seekPct, setSeekPct] = useState(0);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: e => {
        setSeeking(true);
        setSeekPct(Math.max(0, Math.min(1, e.nativeEvent.locationX / trackW.current)));
      },
      onPanResponderMove: e => {
        setSeekPct(Math.max(0, Math.min(1, e.nativeEvent.locationX / trackW.current)));
      },
      onPanResponderRelease: e => {
        const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackW.current));
        const target = pct * durationRef.current;
        ref.current?.seek(target);
        setCurrent(target);
        currentRef.current = target;
        setSeeking(false);
        showControls();
      },
      onPanResponderTerminate: () => setSeeking(false),
    }),
  ).current;

  const onLoad = (data: OnLoadData) => {
    durationRef.current = data.duration;
    setDuration(data.duration);
    setReady(true);
    setError(null);
  };

  const markComplete = () => {
    completedPosted.current = true;
    setDone(true);
    postProgress(durationRef.current || currentRef.current, true);
  };

  const onProgress = (data: OnProgressData) => {
    if (seeking) return;
    setCurrent(data.currentTime);
    currentRef.current = data.currentTime;
    if (buffering) setBuffering(false);

    if (data.currentTime - lastPostedAt.current >= PROGRESS_POST_INTERVAL) {
      lastPostedAt.current = data.currentTime;
      postProgress(data.currentTime, false);
    }
    if (!completedPosted.current && durationRef.current > 0 && data.currentTime / durationRef.current >= COMPLETE_THRESHOLD) {
      completedPosted.current = true;
      setDone(true);
      postProgress(data.currentTime, true);
    }
  };

  const onEnd = () => {
    setPaused(true);
    if (!completedPosted.current) {
      completedPosted.current = true;
      setDone(true);
      postProgress(durationRef.current || currentRef.current, true);
    }
    showControls(false);
  };

  const pct = seeking ? seekPct : duration > 0 ? Math.min(current / duration, 1) : 0;

  const seekBy = (delta: number) => {
    const target = Math.max(0, Math.min(durationRef.current, currentRef.current + delta));
    ref.current?.seek(target);
    setCurrent(target);
    currentRef.current = target;
    showControls();
  };

  const cycleSpeed = () => {
    setRate(r => SPEEDS[(SPEEDS.indexOf(r) + 1) % SPEEDS.length]);
    showControls();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden={fullscreen} />

      <View style={[styles.playerBox, fullscreen ? styles.playerFull : { width: winW, height: playerH, marginTop: insets.top }]}>
        {source ? (
          <Video
            ref={ref}
            source={source}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            paused={paused}
            muted={muted}
            rate={rate}
            onLoad={onLoad}
            onProgress={onProgress}
            onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
            onEnd={onEnd}
            onError={() => setError('Could not play this video. Please try again.')}
            progressUpdateInterval={500}
          />
        ) : (
          <View style={styles.center}><Text style={styles.errTxt}>This video is unavailable.</Text></View>
        )}

        {source && !ready && !error && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadTxt}>Loading…</Text>
          </View>
        )}

        {error && (
          <View style={styles.center}>
            <Icon name="warning" size={28} color={Colors.white} />
            <Text style={styles.errTxt}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setError(null); setReady(false); ref.current?.seek(currentRef.current); }}>
              <Text style={styles.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {ready && buffering && (
          <View style={styles.bufferOverlay} pointerEvents="none"><ActivityIndicator size="small" color={Colors.primary} /></View>
        )}

        <TouchableWithoutFeedback onPress={() => (controls ? setControls(false) : showControls())}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {controls && source && (
          <View style={styles.overlay} pointerEvents="box-none">
            <LinearGradient colors={['rgba(0,0,0,0.85)', 'transparent']} style={styles.topGrad} pointerEvents="box-none">
              <View style={styles.topRow}>
                <TouchableOpacity onPress={() => (fullscreen ? exitFullscreen() : navigation.goBack())} hitSlop={hit} style={styles.iconBtn}>
                  <Text style={styles.iconTxt}>‹</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  {subjectName ? <Text style={styles.topSub}>{subjectName}</Text> : null}
                  <Text style={styles.topTitle} numberOfLines={1}>{title ?? 'Lesson'}</Text>
                </View>
                <View style={styles.hdBadge}><Text style={styles.hdTxt}>1080p</Text></View>
              </View>
            </LinearGradient>

            <View style={styles.centerRow} pointerEvents="box-none">
              <TouchableOpacity onPress={() => seekBy(-10)} hitSlop={hit}><Icon name="rewind" size={26} color={Colors.white} /></TouchableOpacity>
              <TouchableOpacity onPress={() => { setPaused(p => !p); showControls(); }} style={styles.playBtn}>
                <Icon name={paused ? 'play' : 'pause'} size={22} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => seekBy(10)} hitSlop={hit}><Icon name="forward" size={26} color={Colors.white} /></TouchableOpacity>
            </View>

            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.botGrad} pointerEvents="box-none">
              <View style={styles.track} onLayout={e => { trackW.current = e.nativeEvent.layout.width || 1; }} {...pan.panHandlers}>
                <View style={styles.trackBg} />
                <View style={[styles.trackFill, { width: `${pct * 100}%` }]} />
                <View style={[styles.thumb, { left: `${pct * 100}%` }]} />
              </View>
              <View style={styles.botRow}>
                <Text style={styles.time}>{fmt(current)} / {fmt(duration)}</Text>
                {done && (
                  <View style={styles.donePill}><Icon name="checkmark" size={9} color={Colors.white} /><Text style={styles.donePillTxt}>Done</Text></View>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={cycleSpeed} hitSlop={hit} style={styles.speedBtn}><Text style={styles.speedTxt}>{rate}×</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setMuted(m => !m)} hitSlop={hit} style={styles.botIconBtn}><Icon name={muted ? 'mute' : 'volume'} size={18} color={Colors.white} /></TouchableOpacity>
                <TouchableOpacity onPress={toggleFullscreen} hitSlop={hit} style={styles.botIconBtn}><Icon name="fullscreen" size={18} color={Colors.white} /></TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* ── Professional lesson panel ─────────────────────────────── */}
      <ScrollView style={styles.panel} contentContainerStyle={[styles.panelContent, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <Entrance index={0}>
          <View style={styles.chipRow}>
            {subjectName ? <View style={styles.chip}><Icon name="book" size={11} color={Colors.primaryDark} /><Text style={styles.chipTxt}>{subjectName}</Text></View> : null}
            <View style={styles.chip}><Text style={styles.chipTxt}>HD · 1080p</Text></View>
            {duration > 0 ? <View style={styles.chip}><Icon name="clock" size={11} color={Colors.primaryDark} /><Text style={styles.chipTxt}>{fmt(duration)}</Text></View> : null}
          </View>
          <Text style={styles.lessonTitle}>{title ?? 'Lesson'}</Text>
        </Entrance>

        <Entrance index={1}>
          <PressableScale style={[styles.markBtn, done && styles.markBtnDone]} onPress={markComplete} disabled={done}>
            <Icon name="checkmark" size={16} color={done ? Colors.white : Colors.brand} />
            <Text style={[styles.markTxt, done && { color: Colors.white }]}>{done ? 'Completed' : 'Mark as complete'}</Text>
          </PressableScale>
        </Entrance>

        <Entrance index={2}>
          <Text style={styles.sectionTitle}>About this lesson</Text>
          <Text style={styles.body}>
            {lesson.data?.content_body ??
              'Follow along with the video to master this concept. You can change the playback speed, scrub the timeline, and your progress saves automatically — pick up right where you left off next time.'}
          </Text>
        </Entrance>

        <Entrance index={3}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <PressableScale style={styles.resourceRow}>
            <View style={styles.resourceIcon}><Icon name="pdf" size={20} color={Colors.danger} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resourceTitle}>Lesson notes</Text>
              <Text style={styles.resourceSub}>PDF · Key points & summary</Text>
            </View>
            <Icon name="upload" size={18} color={Colors.text3} />
          </PressableScale>
        </Entrance>

        {upNext && (
          <Entrance index={4}>
            <Text style={styles.sectionTitle}>Up next</Text>
            <PressableScale style={styles.upNext} onPress={() => navigation.navigate('LessonDetail', { lessonId: upNext.id, title: upNext.title })}>
              <View style={styles.upNextIcon}><Icon name={upNext.type === 'video' ? 'video' : upNext.type === 'pdf' ? 'pdf' : upNext.type === 'quiz' ? 'edit' : 'document'} size={20} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.upNextLabel}>NEXT LESSON</Text>
                <Text style={styles.upNextTitle} numberOfLines={1}>{upNext.title}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </PressableScale>
          </Entrance>
        )}

        <Text style={styles.hint}>Your progress saves automatically as you watch.</Text>
      </ScrollView>
    </View>
  );
};

const hit = { top: 10, bottom: 10, left: 10, right: 10 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  playerBox: { backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  playerFull: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, marginTop: 0 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  errTxt: { color: '#fff', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { marginTop: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: 999 },
  retryTxt: { color: Colors.brand, fontWeight: '700', fontSize: 12 },
  bufferOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' },
  topGrad: { paddingBottom: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  iconTxt: { color: '#fff', fontSize: 24, lineHeight: 26 },
  topSub: { color: 'rgba(196,149,96,0.85)', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  topTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  hdBadge: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  hdTxt: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  centerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(196,149,96,0.95)', alignItems: 'center', justifyContent: 'center' },
  botGrad: { paddingTop: 28, paddingHorizontal: 12, paddingBottom: 10 },
  track: { height: 28, justifyContent: 'center' },
  trackBg: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  trackFill: { position: 'absolute', height: 4, borderRadius: 2, backgroundColor: Colors.primary, left: 0 },
  thumb: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, borderWidth: 2, borderColor: '#fff', marginLeft: -7 },
  botRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  time: { color: '#fff', fontSize: 11, fontWeight: '600' },
  donePill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.success, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  donePillTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  speedBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.15)' },
  speedTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  botIconBtn: { padding: 4 },

  panel: { flex: 1 },
  panelContent: { padding: 18, gap: 18, paddingBottom: 32 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  chipTxt: { fontSize: 10.5, fontWeight: '800', color: Colors.primaryDark, letterSpacing: 0.2 },
  lessonTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, letterSpacing: -0.5, lineHeight: 26 },
  markBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, ...Shadow.sm },
  markBtnDone: { backgroundColor: Colors.success },
  markTxt: { fontSize: 14, fontWeight: '800', color: Colors.brand },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  body: { fontSize: 13, color: Colors.text2, lineHeight: 20 },
  resourceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  resourceIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  resourceTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  resourceSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  upNext: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  upNextIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  upNextLabel: { fontSize: 9, fontWeight: '800', color: Colors.primaryDark, letterSpacing: 0.6 },
  upNextTitle: { fontSize: 13.5, fontWeight: '700', color: Colors.text, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.text3 },
  hint: { fontSize: 11, color: Colors.text3, textAlign: 'center' },
});
