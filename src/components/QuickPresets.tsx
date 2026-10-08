import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from '../store/useHonglogStore';
import { THEME, LIGHT_THEME, ThemeColors } from '../types';

export const QuickPresets: React.FC = () => {
  const { meta, form, setForm, toggleCamera, isDarkMode } = useHonglogStore();
  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;

  const handleSelect = (field: 'card' | 'lens' | 'shutter' | 'iso' | 'filter', val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setForm({ [field]: val });
  };

  const isMultiCam = (form.selectedCameras || []).length > 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Camera Selection - Multiple Selection Support */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>CAMERA (BISA MULTI-KAMERA)</Text>
          {isMultiCam && (
            <View style={[styles.multiCamTag, { backgroundColor: theme.accentWash, borderColor: theme.accent }]}>
              <Text style={[styles.multiCamTagText, { color: theme.accent }]}>
                🎥 {form.selectedCameras.length} KAMERA AKTIF
              </Text>
            </View>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.cameras.map((cam) => {
            const isSelected = (form.selectedCameras || [form.camera]).includes(cam);
            return (
              <TouchableOpacity
                key={cam}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleCamera(cam);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {isSelected ? '✓ ' : ''}{cam}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={[styles.hintText, { color: theme.textFaint }]}>
          * Ketuk nama kamera untuk memilih/menambah kamera (bisa pilih Cam A + Cam B sekaligus untuk 1 slate).
        </Text>
      </View>

      {/* Media Card / Roll - Auto updates clip name */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>ROLL / CARD</Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            NEXT: {form.clipName || '—'}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.cards.map((card) => {
            const isSelected = form.card === card;
            return (
              <TouchableOpacity
                key={card}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleSelect('card', card)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {card}
                </Text>
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
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleSelect('lens', lens)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {lens}mm
                </Text>
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
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleSelect('shutter', sh)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {sh}
                </Text>
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
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleSelect('iso', iso)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {iso}
                </Text>
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
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleSelect('filter', fil)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {fil}
                </Text>
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  section: {
    gap: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLbl: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  multiCamTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  multiCamTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  clipHintBadge: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
  },
  hintText: {
    fontSize: 9.5,
    marginTop: 2,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
