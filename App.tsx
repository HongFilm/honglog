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
  const systemColorScheme = useColorScheme();
  const { hydrate, isHydrated, meta, takes, isDarkMode, toggleTheme, setDarkMode } = useHonglogStore();
  const [activeTab, setActiveTab] = useState<Tab>('slate');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      setDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme]);

  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  // Smooth Tab Transition Animation
  const tabFade = useRef(new Animated.Value(1)).current;
  const tabTranslateX = useRef(new Animated.Value(0)).current;

  const tabOrder: Record<Tab, number> = {
    slate: 0,
    takes: 1,
    setup: 2,
    export: 3,
  };

  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => {
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);

  const handleTabChange = (nextTab: Tab) => {
    if (nextTab === activeTab) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isMovingRight = tabOrder[nextTab] > tabOrder[activeTab];
    const exitOffset = isMovingRight ? -14 : 14;
    const entryOffset = isMovingRight ? 14 : -14;

    Animated.parallel([
      Animated.timing(tabFade, {
        toValue: 0,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(tabTranslateX, {
        toValue: exitOffset,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(nextTab);
      tabTranslateX.setValue(entryOffset);
      Animated.parallel([
        Animated.timing(tabFade, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(tabTranslateX, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

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

          <View style={[styles.statusPill, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
            <View style={[styles.statusDot, { backgroundColor: theme.good }]} />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>OFFLINE</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <Animated.View
          style={[
            styles.contentWrap,
            {
              opacity: tabFade,
              transform: [{ translateX: tabTranslateX }],
            },
          ]}
        >
          {activeTab === 'slate' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <SlateControl />
              <QuickPresets />
            </ScrollView>
          )}

          {activeTab === 'takes' && <TakesList />}

          {activeTab === 'setup' && <ProjectSetup />}

          {activeTab === 'export' && <ExportScreen />}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Bottom Tab Bar - DOCKED TO BOTTOM (Natap Layar Bawah) */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'slate' && styles.tabItemActive]}
          onPress={() => handleTabChange('slate')}
        >
          <Feather name="film" size={17} color={activeTab === 'slate' ? theme.accent : theme.textFaint} />
          <Text style={[styles.tabLabel, { color: activeTab === 'slate' ? theme.accent : theme.textFaint }]}>SLATE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'takes' && styles.tabItemActive]}
          onPress={() => handleTabChange('takes')}
        >
          <Feather name="list" size={17} color={activeTab === 'takes' ? theme.accent : theme.textFaint} />
          <View style={styles.tabBadgeRow}>
            <Text style={[styles.tabLabel, { color: activeTab === 'takes' ? theme.accent : theme.textFaint }]}>TAKES</Text>
            {takes.length > 0 && (
              <View style={[styles.badgeCount, { backgroundColor: theme.accent }]}>
                <Text style={styles.badgeCountText}>{takes.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'setup' && styles.tabItemActive]}
          onPress={() => handleTabChange('setup')}
        >
          <Feather name="sliders" size={17} color={activeTab === 'setup' ? theme.accent : theme.textFaint} />
          <Text style={[styles.tabLabel, { color: activeTab === 'setup' ? theme.accent : theme.textFaint }]}>SETUP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'export' && styles.tabItemActive]}
          onPress={() => handleTabChange('export')}
        >
          <Feather name="share-2" size={17} color={activeTab === 'export' ? theme.accent : theme.textFaint} />
          <Text style={[styles.tabLabel, { color: activeTab === 'export' ? theme.accent : theme.textFaint }]}>EXPORT</Text>
        </TouchableOpacity>
      </View>

      {/* Branded Fading Splash Screen Overlay */}
      {showSplash && (
        <Animated.View
          style={[
            styles.splashOverlay,
            {
              opacity: splashOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.splashCenter}>
            <Image
              source={require('./assets/logo.jpeg')}
              style={styles.splashLogo}
              resizeMode="contain"
            />
            <Text style={styles.splashTitle}>HONGLOG</Text>
            <Text style={styles.splashSub}>DIGITAL CAMERA REPORT & SLATE</Text>
          </View>
          <View style={[styles.splashFooter, { paddingBottom: Math.max(insets.bottom, 24) }]}>
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
  contentWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 5,
    gap: 4,
  },
  tabItemActive: {
    opacity: 1,
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
  splashLogo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: 8,
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
