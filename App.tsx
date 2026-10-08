import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from './src/store/useHonglogStore';
import { SlateControl } from './src/components/SlateControl';
import { QuickPresets } from './src/components/QuickPresets';
import { TakesList } from './src/components/TakesList';
import { ProjectSetup } from './src/components/ProjectSetup';
import { ExportScreen } from './src/components/ExportScreen';
import { THEME } from './src/types';

type Tab = 'slate' | 'takes' | 'setup' | 'export';

export default function App() {
  const { hydrate, isHydrated, meta, takes } = useHonglogStore();
  const [activeTab, setActiveTab] = useState<Tab>('slate');

  useEffect(() => {
    hydrate();
  }, []);

  const handleTabChange = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🎬 Memuat Honglog...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F12" />

      {/* Top Header Bar */}
      <View style={styles.topbar}>
        <View style={styles.brandRow}>
          <Image source={require('./assets/logo.jpeg')} style={styles.topLogo} resizeMode="contain" />
          <View>
            <Text style={styles.appTitle}>HONGLOG</Text>
            <Text style={styles.prodSubtitle} numberOfLines={1}>
              {meta.production || 'Hong Films Production'}
            </Text>
          </View>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>OFFLINE READY</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.contentWrap}>
          {activeTab === 'slate' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <SlateControl />
              <QuickPresets />
            </ScrollView>
          )}

          {activeTab === 'takes' && <TakesList />}

          {activeTab === 'setup' && <ProjectSetup />}

          {activeTab === 'export' && <ExportScreen />}
        </View>
      </KeyboardAvoidingView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'slate' && styles.tabItemActive]}
          onPress={() => handleTabChange('slate')}
        >
          <Text style={[styles.tabIcon, activeTab === 'slate' && styles.tabIconActive]}>🎬</Text>
          <Text style={[styles.tabLabel, activeTab === 'slate' && styles.tabLabelActive]}>SLATE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'takes' && styles.tabItemActive]}
          onPress={() => handleTabChange('takes')}
        >
          <Text style={[styles.tabIcon, activeTab === 'takes' && styles.tabIconActive]}>📋</Text>
          <View style={styles.tabBadgeRow}>
            <Text style={[styles.tabLabel, activeTab === 'takes' && styles.tabLabelActive]}>TAKES</Text>
            {takes.length > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{takes.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'setup' && styles.tabItemActive]}
          onPress={() => handleTabChange('setup')}
        >
          <Text style={[styles.tabIcon, activeTab === 'setup' && styles.tabIconActive]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'setup' && styles.tabLabelActive]}>SETUP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'export' && styles.tabItemActive]}
          onPress={() => handleTabChange('export')}
        >
          <Text style={[styles.tabIcon, activeTab === 'export' && styles.tabIconActive]}>📄</Text>
          <Text style={[styles.tabLabel, activeTab === 'export' && styles.tabLabelActive]}>EXPORT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F12',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FF8A3D',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  topbar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
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
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textPrimary,
    letterSpacing: 1.2,
  },
  prodSubtitle: {
    fontSize: 11,
    color: THEME.accent,
    fontWeight: '600',
    maxWidth: 180,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.surface,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.good,
  },
  statusText: {
    fontSize: 9.5,
    color: THEME.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  keyboardContainer: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  tabItemActive: {
    opacity: 1,
  },
  tabIcon: {
    fontSize: 17,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.textFaint,
    letterSpacing: 0.8,
  },
  tabLabelActive: {
    color: THEME.accent,
  },
  tabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeCount: {
    backgroundColor: THEME.accent,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeCountText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#000',
  },
});
