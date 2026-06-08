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
  useWindowDimensions,
} from 'react-native';
import Video, { type VideoRef, type OnLoadData, type OnProgressData } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors } from '../../theme';
import { StudentApi, authedVideoSource } from '../../api';
import { Icon } from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<StudentStackParamList, 'LessonVideo'>;

const fmt = (s: number): string => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const PROGRESS_POST_INTERVAL = 10; // seconds between progress pings
const COMPLETE_THRESHOLD = 0.9; // ≥90% watched → completed

export const LessonVideoScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId, url, title, subjectName } = route.params;
  const { token } = useAuth();
  const { width: winW } = useWindowDimensions();
  const playerH = Math.round(winW * (9 / 16));

  const source = authedVideoSource(url, token);

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

  // ── Progress reporting ────────────────────────────────────────────────────
  const lastPostedAt = useRef(0);
  const completedPosted = useRef(false);
  const currentRef = useRef(0);
  const durationRef = useRef(0);

  const postProgress = useCallback(
    (seconds: number, completed: boolean) => {
      // Fire-and-forget — progress is best-effort and must not block playback.
      StudentApi.postProgress(lessonId, {
        watched_seconds: Math.max(0, Math.floor(seconds)),
        completed,
      }).catch(() => {});
    },
    [lessonId],
  );

  // Save the latest position when leaving the screen.
  useEffect(
    () => () => {
      if (!completedPosted.current && currentRef.current > lastPostedAt.current + 2) {
        postProgress(currentRef.current, false);
      }
    },
    [postProgress],
  );

  // ── Auto-hide controls ────────────────────────────────────────────────────
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

  // ── Seekbar ───────────────────────────────────────────────────────────────
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

  // ── Video callbacks ───────────────────────────────────────────────────────
  const onLoad = (data: OnLoadData) => {
    durationRef.current = data.duration;
    setDuration(data.duration);
    setReady(true);
    setError(null);
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
    if (
      !completedPosted.current &&
      durationRef.current > 0 &&
      data.currentTime / durationRef.current >= COMPLETE_THRESHOLD
    ) {
      completedPosted.current = true;
      postProgress(data.currentTime, true);
    }
  };

  const onEnd = () => {
    setPaused(true);
    if (!completedPosted.current) {
      completedPosted.current = true;
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

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={[styles.playerBox, { width: winW, height: playerH }]}>
        {source ? (
          <Video
            ref={ref}
            source={source}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            paused={paused}
            muted={muted}
            fullscreen={fullscreen}
            onLoad={onLoad}
            onProgress={onProgress}
            onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
            onEnd={onEnd}
            onError={() => setError('Could not play this video. Please try again.')}
            onFullscreenPlayerWillDismiss={() => setFullscreen(false)}
            progressUpdateInterval={500}
          />
        ) : (
          <View style={styles.center}>
            <Text style={styles.errTxt}>This video is unavailable.</Text>
          </View>
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
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setError(null);
                setReady(false);
                ref.current?.seek(currentRef.current);
              }}
            >
              <Text style={styles.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {ready && buffering && (
          <View style={styles.bufferOverlay} pointerEvents="none">
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}

        {/* Tap to toggle controls */}
        <TouchableWithoutFeedback onPress={() => (controls ? setControls(false) : showControls())}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Controls overlay */}
        {controls && source && (
          <View style={styles.overlay} pointerEvents="box-none">
            {/* Top */}
            <LinearGradient colors={['rgba(0,0,0,0.85)', 'transparent']} style={styles.topGrad} pointerEvents="box-none">
              <View style={styles.topRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={hit} style={styles.iconBtn}>
                  <Text style={styles.iconTxt}>‹</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  {subjectName ? <Text style={styles.topSub}>{subjectName}</Text> : null}
                  <Text style={styles.topTitle} numberOfLines={1}>
                    {title ?? 'Lesson'}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Center transport */}
            <View style={styles.centerRow} pointerEvents="box-none">
              <TouchableOpacity onPress={() => seekBy(-10)} hitSlop={hit}>
                <Icon name="rewind" size={26} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPaused(p => !p);
                  showControls();
                }}
                style={styles.playBtn}
              >
                <Icon name={paused ? 'play' : 'pause'} size={22} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => seekBy(10)} hitSlop={hit}>
                <Icon name="forward" size={26} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Bottom */}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.botGrad} pointerEvents="box-none">
              <View
                style={styles.track}
                onLayout={e => {
                  trackW.current = e.nativeEvent.layout.width || 1;
                }}
                {...pan.panHandlers}
              >
                <View style={styles.trackBg} />
                <View style={[styles.trackFill, { width: `${pct * 100}%` }]} />
                <View style={[styles.thumb, { left: `${pct * 100}%` }]} />
              </View>
              <View style={styles.botRow}>
                <Text style={styles.time}>
                  {fmt(current)} / {fmt(duration)}
                </Text>
                {completedPosted.current && (
                  <View style={styles.donePill}>
                    <Icon name="checkmark" size={9} color={Colors.white} />
                    <Text style={styles.donePillTxt}>Done</Text>
                  </View>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setMuted(m => !m)} hitSlop={hit} style={styles.botIconBtn}>
                  <Icon name={muted ? 'mute' : 'volume'} size={18} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFullscreen(true)} hitSlop={hit} style={styles.botIconBtn}>
                  <Icon name="fullscreen" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Below the player */}
      <View style={styles.meta}>
        <Text style={styles.metaTitle}>{title ?? 'Lesson'}</Text>
        {subjectName ? <Text style={styles.metaSub}>{subjectName}</Text> : null}
        <Text style={styles.metaHint}>Your progress saves automatically as you watch.</Text>
      </View>
    </SafeAreaView>
  );
};

const hit = { top: 10, bottom: 10, left: 10, right: 10 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0506' },
  playerBox: { backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  errTxt: { color: '#fff', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  retryTxt: { color: Colors.brand, fontWeight: '700', fontSize: 12 },
  bufferOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' },
  topGrad: { paddingBottom: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { color: '#fff', fontSize: 24, lineHeight: 26 },
  topSub: { color: 'rgba(196,149,96,0.85)', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  topTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  centerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(196,149,96,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botGrad: { paddingTop: 28, paddingHorizontal: 12, paddingBottom: 10 },
  track: { height: 28, justifyContent: 'center' },
  trackBg: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  trackFill: { position: 'absolute', height: 4, borderRadius: 2, backgroundColor: Colors.primary, left: 0 },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -7,
  },
  botRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  time: { color: '#fff', fontSize: 11, fontWeight: '600' },
  donePill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.success, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  donePillTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  botIconBtn: { padding: 4 },
  meta: { padding: 18, gap: 4 },
  metaTitle: { color: '#F5E8D0', fontSize: 16, fontWeight: '800' },
  metaSub: { color: 'rgba(196,149,96,0.8)', fontSize: 12, fontWeight: '600' },
  metaHint: { color: 'rgba(245,232,208,0.5)', fontSize: 11, marginTop: 6 },
});
