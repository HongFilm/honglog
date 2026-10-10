import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  useColorScheme,
  Appearance,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Easing,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useHonglogStore } from './src/store/useHonglogStore';
import { SlateControl } from './src/components/SlateControl';
import { QuickPresets } from './src/components/QuickPresets';
import { TakesList } from './src/components/TakesList';
import { ProjectSetup } from './src/components/ProjectSetup';
import { ExportScreen } from './src/components/ExportScreen';
import { THEME, LIGHT_THEME, ThemeColors } from './src/types';

type Tab = 'slate' | 'takes' | 'setup' | 'export';

function MainApp() {
  const { width: windowWidth } = useWindowDimensions();
  const systemColorScheme = useColorScheme();
  const { hydrate, isHydrated, meta, takes, isDarkMode, toggleTheme, setDarkMode } = useHonglogStore();
  const [activeTab, setActiveTab] = useState<Tab>('slate');
  const insets = useSafeAreaInsets();

  const pagerRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isProgrammaticScroll = useRef(false);

  const isDarkEffective = Platform.OS === 'ios'
    ? (systemColorScheme ?? Appearance.getColorScheme()) === 'dark'
    : isDarkMode;

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const current = (systemColorScheme ?? Appearance.getColorScheme()) === 'dark';
      setDarkMode(current);
    }
  }, [systemColorScheme]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const sub = Appearance.addChangeListener(({ colorScheme }) => {
        setDarkMode(colorScheme === 'dark');
      });
      return () => sub.remove();
    }
  }, []);

  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.95)).current;

  // Cinematic Splash Entrance - Icon starts immediately together with background
  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const tabs: { key: Tab; label: string; icon: 'film' | 'list' | 'sliders' | 'share-2' }[] = [
    { key: 'slate', label: 'SLATE', icon: 'film' },
    { key: 'takes', label: 'TAKES', icon: 'list' },
    { key: 'setup', label: 'SETUP', icon: 'sliders' },
    { key: 'export', label: 'EXPORT', icon: 'share-2' },
  ];

  const tabOrder: Record<Tab, number> = {
    slate: 0,
    takes: 1,
    setup: 2,
    export: 3,
  };

  const theme: ThemeColors = isDarkEffective ? THEME : LIGHT_THEME;

  // Liquid glass pill indicator calculations
  const barMarginHorizontal = 16;
  const barWidth = Math.max(windowWidth - (barMarginHorizontal * 2), 200);
  const barPadding = 4;
  const tabWidth = (barWidth - (barPadding * 2)) / 4;

  const pillTranslateX = scrollX.interpolate({
    inputRange: [0, windowWidth, windowWidth * 2, windowWidth * 3],
    outputRange: [0, tabWidth, tabWidth * 2, tabWidth * 3],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    hydrate();
  }, []);

  // Cinematic Splash Exit - Smooth dissolve transition
  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(splashScale, {
            toValue: 1.05,
            duration: 500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSplash(false);
        });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);

  const handleTabChange = (nextTab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isProgrammaticScroll.current = true;
    setActiveTab(nextTab);
    const targetX = tabOrder[nextTab] * windowWidth;
    pagerRef.current?.scrollTo({ x: targetX, animated: true });
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 400);
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.min(Math.max(Math.round(offsetX / windowWidth), 0), 3);
    const targetTab = tabs[pageIndex].key;
    if (targetTab !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(targetTab);
    }
  };

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkEffective ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      {/* Top Header Bar - Docked to top safe area */}
      <View
        style={[
          styles.topbar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            paddingTop: Math.max(insets.top, 12),
          },
        ]}
      >
        <View style={styles.brandRow}>
          <Image source={require('./assets/logo.jpeg')} style={styles.topLogo} resizeMode="contain" />
          <View>
            <Text style={[styles.appTitle, { color: theme.textPrimary }]}>HONGLOG</Text>
            <Text style={[styles.prodSubtitle, { color: theme.accent }]} numberOfLines={1}>
              {meta.production || 'Hong Films Production'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Theme Toggle Button - Android Only (iOS follows system appearance) */}
          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
              onPress={handleToggleTheme}
              activeOpacity={0.7}
            >
              <Feather name={isDarkMode ? 'sun' : 'moon'} size={15} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Swipable Screen Pager - Gestures allow sliding horizontally across pages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.pagerContainer}
        >
          {/* Page 0: SLATE */}
          <View style={[styles.pageWrap, { width: windowWidth }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <SlateControl />
              <QuickPresets />
            </ScrollView>
          </View>

          {/* Page 1: TAKES */}
          <View style={[styles.pageWrap, { width: windowWidth }]}>
            <TakesList />
          </View>

          {/* Page 2: SETUP */}
          <View style={[styles.pageWrap, { width: windowWidth }]}>
            <ProjectSetup />
          </View>

          {/* Page 3: EXPORT */}
          <View style={[styles.pageWrap, { width: windowWidth }]}>
            <ExportScreen />
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Liquid Glass Floating Tab Bar with Sliding Pill Indicator */}
      <View style={[styles.glassNavbarWrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View
          style={[
            styles.glassNavbarContainer,
            {
              backgroundColor: isDarkEffective ? 'rgba(20, 21, 27, 0.88)' : 'rgba(255, 255, 255, 0.90)',
              borderColor: isDarkEffective ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              shadowColor: isDarkEffective ? '#000' : '#888',
            },
          ]}
        >
          {/* Animated Liquid Pill that glides across tabs */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slidingPill,
              {
                width: tabWidth,
                transform: [{ translateX: pillTranslateX }],
                backgroundColor: isDarkEffective ? 'rgba(229, 57, 53, 0.18)' : 'rgba(229, 57, 53, 0.12)',
                borderColor: theme.accent,
              },
            ]}
          />

          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.glassTabItem}
                onPress={() => handleTabChange(tab.key)}
                activeOpacity={0.7}
              >
                <Feather
                  name={tab.icon}
                  size={17}
                  color={isActive ? theme.accent : theme.textFaint}
                />
                <View style={styles.tabBadgeRow}>
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isActive ? theme.accent : theme.textFaint },
                      isActive && { fontWeight: '800' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {tab.key === 'takes' && takes.length > 0 && (
                    <View style={[styles.badgeCount, { backgroundColor: theme.accent }]}>
                      <Text style={styles.badgeCountText}>{takes.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Branded Cinematic Fading Splash Screen Overlay */}
      {showSplash && (
        <Animated.View
          style={[
            styles.splashOverlay,
            {
              opacity: splashOpacity,
              transform: [{ scale: splashScale }],
            },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.splashCenter,
              {
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.splashLogoWrap}>
              <Image
                source={require('./assets/logo.jpeg')}
                style={styles.splashLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.splashTitle}>HONGLOG</Text>
            <Text style={styles.splashSub}>DIGITAL CAMERA REPORT & SLATE</Text>
          </Animated.View>
          <View
            style={[
              styles.splashFooter,
              {
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <Text style={styles.splashBy}>HONG FILMS</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  topbar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  topLogo: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  prodSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 180,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  keyboardContainer: {
    flex: 1,
  },
  pagerContainer: {
    flex: 1,
  },
  pageWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  glassNavbarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  glassNavbarContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 4,
    position: 'relative',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  slidingPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  glassTabItem: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    gap: 3,
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeCount: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeCountText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#000',
  },

  // Splash Screen Styles
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splashLogoWrap: {
    width: 104,
    height: 104,
    borderRadius: 24,
    backgroundColor: '#121215',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 57, 53, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  splashLogo: {
    width: 96,
    height: 96,
    borderRadius: 20,
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  splashSub: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.accent,
    fontFamily: THEME.fontMono,
    letterSpacing: 2,
  },
  splashFooter: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  splashBy: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 2.5,
  },
});
