import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  ClothingItem,
  describeClothing,
  loadWardrobe,
  pickRandomItem,
} from '@/lib/clothing';

type ScanState =
  | { kind: 'idle' }
  | { kind: 'scanning' }
  | { kind: 'result'; item: ClothingItem }
  | { kind: 'empty' };

const SCAN_DURATION_MS = 2200;

export default function ScanScreen() {
  const theme = useTheme();
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [state, setState] = useState<ScanState>({ kind: 'idle' });
  const [permission, requestPermission] = useCameraPermissions();
  const sweep = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // Open the real camera as soon as the screen is shown.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadWardrobe().then((items) => {
        if (active) setWardrobe(items);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    if (state.kind !== 'scanning') {
      sweep.stopAnimation();
      sweep.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [state.kind, sweep]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const handleScan = () => {
    if (wardrobe.length === 0) {
      setState({ kind: 'empty' });
      return;
    }
    setState({ kind: 'scanning' });
    setTimeout(() => {
      const picked = pickRandomItem(wardrobe);
      if (!picked) {
        setState({ kind: 'empty' });
        return;
      }
      setState({ kind: 'result', item: picked });
    }, SCAN_DURATION_MS);
  };

  const handleReset = () => setState({ kind: 'idle' });

  const sweepTranslate = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-160, 160],
  });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Scan</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.headerSubtitle}>
            Hold a garment in front of the camera
          </ThemedText>
        </View>

        <View style={[styles.viewfinder, { borderColor: theme.backgroundSelected }]}>
          <View style={styles.viewfinderInner}>
            {state.kind === 'result' ? (
              <ResultView item={state.item} onReset={handleReset} />
            ) : (
              <FakeCamera
                state={state.kind}
                cameraEnabled={!!permission?.granted}
                onEnableCamera={requestPermission}
                sweepTranslate={sweepTranslate}
                pulseScale={pulseScale}
                pulseOpacity={pulseOpacity}
              />
            )}
          </View>
          <Corner position="tl" color={theme.text} />
          <Corner position="tr" color={theme.text} />
          <Corner position="bl" color={theme.text} />
          <Corner position="br" color={theme.text} />
        </View>

        <View style={styles.actions}>
          <StatusLine state={state} wardrobeSize={wardrobe.length} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={state.kind === 'scanning' ? 'Scanning' : 'Scan clothing'}
            onPress={state.kind === 'result' ? handleReset : handleScan}
            disabled={state.kind === 'scanning'}
            style={({ pressed }) => [
              styles.scanButton,
              { backgroundColor: theme.accent },
              pressed && styles.pressed,
              state.kind === 'scanning' && styles.scanButtonDisabled,
            ]}>
            <ThemedText
              type="default"
              style={[styles.scanButtonLabel, { color: theme.accentText }]}>
              {state.kind === 'scanning'
                ? 'Analyzing…'
                : state.kind === 'result'
                  ? 'Scan again'
                  : 'Scan clothing'}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function FakeCamera({
  state,
  cameraEnabled,
  onEnableCamera,
  sweepTranslate,
  pulseScale,
  pulseOpacity,
}: {
  state: ScanState['kind'];
  cameraEnabled: boolean;
  onEnableCamera: () => void;
  sweepTranslate: Animated.AnimatedInterpolation<number>;
  pulseScale: Animated.AnimatedInterpolation<number>;
  pulseOpacity: Animated.AnimatedInterpolation<number>;
}) {
  return (
    <View style={styles.fakeCamera}>
      {cameraEnabled ? (
        <CameraView style={styles.cameraFeed} facing="front" />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enable camera"
          onPress={onEnableCamera}
          style={styles.permissionPrompt}>
          <ThemedText type="small" style={styles.cameraText}>
            Tap to enable the camera
          </ThemedText>
        </Pressable>
      )}
      <View style={styles.cameraGrain} pointerEvents="none" />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.reticle,
          { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
        ]}
      />
      {state === 'scanning' && (
        <Animated.View
          pointerEvents="none"
          style={[styles.scanLine, { transform: [{ translateY: sweepTranslate }] }]}
        />
      )}
      <View style={styles.cameraTextWrap} pointerEvents="none">
        <ThemedText type="small" style={styles.cameraText}>
          {state === 'scanning' ? 'Detecting colors and patterns…' : 'Camera ready'}
        </ThemedText>
      </View>
    </View>
  );
}

function ResultView({ item, onReset: _onReset }: { item: ClothingItem; onReset: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.resultView}>
      <View style={[styles.matchBadge, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          MATCH FOUND
        </ThemedText>
      </View>
      <ThemedText type="title" style={styles.resultName}>
        {item.name}
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.resultDescription}>
        {describeClothing(item)}
      </ThemedText>
    </View>
  );
}

function StatusLine({ state, wardrobeSize }: { state: ScanState; wardrobeSize: number }) {
  if (state.kind === 'empty') {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.statusText}>
        Your wardrobe is empty. Add a garment first.
      </ThemedText>
    );
  }
  if (state.kind === 'scanning') {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.statusText}>
        Analyzing fabric, color and stains…
      </ThemedText>
    );
  }
  if (state.kind === 'result') {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.statusText}>
        Tap to scan another garment.
      </ThemedText>
    );
  }
  return (
    <ThemedText type="small" themeColor="textSecondary" style={styles.statusText}>
      {wardrobeSize === 0
        ? 'Add clothes from the Add tab to start scanning.'
        : `${wardrobeSize} garment${wardrobeSize === 1 ? '' : 's'} ready to recognize.`}
    </ThemedText>
  );
}

function Corner({
  position,
  color,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  color: string;
}) {
  const isTop = position[0] === 't';
  const isLeft = position[1] === 'l';
  return (
    <View
      pointerEvents="none"
      style={[
        styles.corner,
        {
          borderColor: color,
          borderTopWidth: isTop ? 3 : 0,
          borderBottomWidth: isTop ? 0 : 3,
          borderLeftWidth: isLeft ? 3 : 0,
          borderRightWidth: isLeft ? 0 : 3,
          top: isTop ? -1 : undefined,
          bottom: isTop ? undefined : -1,
          left: isLeft ? -1 : undefined,
          right: isLeft ? undefined : -1,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  header: {
    paddingTop: Platform.OS === 'web' ? Spacing.six : Spacing.three,
    gap: Spacing.one,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  viewfinder: {
    flex: 1,
    borderRadius: Spacing.four,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  viewfinderInner: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: Spacing.four,
  },
  fakeCamera: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFeed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  permissionPrompt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraGrain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  reticle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.light.accent,
    opacity: 0.85,
    shadowColor: Colors.light.accent,
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  cameraTextWrap: {
    position: 'absolute',
    bottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Spacing.three,
  },
  cameraText: {
    color: '#ffffff',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  resultView: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  resultName: {
    fontSize: 36,
    lineHeight: 40,
  },
  resultDescription: {
    fontSize: 17,
    lineHeight: 24,
  },
  actions: {
    gap: Spacing.three,
  },
  statusText: {
    textAlign: 'center',
  },
  scanButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
