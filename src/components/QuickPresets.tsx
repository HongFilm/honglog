import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from '../store/useHonglogStore';
import { THEME, LIGHT_THEME, ThemeColors } from '../types';

export const QuickPresets: React.FC = () => {
  const { meta, form, setForm, isDarkMode } = useHonglogStore();
  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;

  const handleSelect = (field: 'camera' | 'card' | 'lens' | 'shutter' | 'iso' | 'filter', val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setForm({ [field]: val });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Camera Selection */}
      <View style={styles.section}>
        <Text style={[styles.headerLbl, { color: theme.textFaint }]}>CAMERA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.cameras.map((cam) => {
            const isSelected = form.camera === cam;
            return (
              <TouchableOpacity
                key={cam}
                style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent }]}
                onPress={() => handleSelect('camera', cam)}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, isSelected && { color: theme.accent, fontWeight: '700' }]}>{cam}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Media Card / Roll */}
      <View style={styles.section}>
        <Text style={[styles.headerLbl, { color: theme.textFaint }]}>ROLL / CARD</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.cards.map((card) => {
            const isSelected = form.card === card;
            return (
              <TouchableOpacity
                key={card}
                style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent }]}
                onPress={() => handleSelect('card', card)}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, isSelected && { color: theme.accent, fontWeight: '700' }]}>{card}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lens */}
      <View style={styles.section}>
        <Text style={[styles.headerLbl, { color: theme.textFaint }]}>LENS (MM)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.lenses.map((lens) => {
            const isSelected = form.lens === lens;
            return (
              <TouchableOpacity
                key={lens}
                style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent }]}
                onPress={() => handleSelect('lens', lens)}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, isSelected && { color: theme.accent, fontWeight: '700' }]}>{lens}mm</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Shutter */}
      <View style={styles.section}>
        <Text style={[styles.headerLbl, { color: theme.textFaint }]}>SHUTTER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.shutters.map((sh) => {
            const isSelected = form.shutter === sh;
            return (
              <TouchableOpacity
                key={sh}
                style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent }]}
                onPress={() => handleSelect('shutter', sh)}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, isSelected && { color: theme.accent, fontWeight: '700' }]}>{sh}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ISO */}
      <View style={styles.section}>
        <Text style={[styles.headerLbl, { color: theme.textFaint }]}>ISO</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.isos.map((iso) => {
            const isSelected = form.iso === iso;
            return (
              <TouchableOpacity
                key={iso}
                style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent }]}
                onPress={() => handleSelect('iso', iso)}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, isSelected && { color: theme.accent, fontWeight: '700' }]}>{iso}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filters / ND */}
      <View style={styles.section}>
        <Text style={[styles.headerLbl, { color: theme.textFaint }]}>FILTER / ND</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.filters.map((fil) => {
            const isSelected = form.filter === fil;
            return (
              <TouchableOpacity
                key={fil}
                style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent }]}
                onPress={() => handleSelect('filter', fil)}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, isSelected && { color: theme.accent, fontWeight: '700' }]}>{fil}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 14,
    gap: 10,
  },
  section: {
    gap: 4,
  },
  headerLbl: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.textFaint,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: THEME.surfaceRaised,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chipActive: {
    backgroundColor: THEME.accentWash,
    borderColor: THEME.accent,
  },
  chipText: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: THEME.accent,
    fontWeight: '700',
  },
});
