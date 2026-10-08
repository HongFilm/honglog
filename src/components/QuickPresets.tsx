import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from '../store/useHonglogStore';

export const QuickPresets: React.FC = () => {
  const { meta, form, setForm } = useHonglogStore();

  const handleSelect = (field: 'camera' | 'card' | 'lens' | 'shutter' | 'iso' | 'filter', val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setForm({ [field]: val });
  };

  return (
    <View style={styles.container}>
      {/* Camera Selection */}
      <View style={styles.section}>
        <Text style={styles.headerLbl}>CAMERA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.cameras.map((cam) => {
            const isSelected = form.camera === cam;
            return (
              <TouchableOpacity
                key={cam}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => handleSelect('camera', cam)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cam}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Media Card / Roll */}
      <View style={styles.section}>
        <Text style={styles.headerLbl}>ROLL / CARD</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.cards.map((card) => {
            const isSelected = form.card === card;
            return (
              <TouchableOpacity
                key={card}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => handleSelect('card', card)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{card}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lens */}
      <View style={styles.section}>
        <Text style={styles.headerLbl}>LENS (MM)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.lenses.map((lens) => {
            const isSelected = form.lens === lens;
            return (
              <TouchableOpacity
                key={lens}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => handleSelect('lens', lens)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{lens}mm</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Shutter */}
      <View style={styles.section}>
        <Text style={styles.headerLbl}>SHUTTER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.shutters.map((sh) => {
            const isSelected = form.shutter === sh;
            return (
              <TouchableOpacity
                key={sh}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => handleSelect('shutter', sh)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{sh}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ISO */}
      <View style={styles.section}>
        <Text style={styles.headerLbl}>ISO</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.isos.map((iso) => {
            const isSelected = form.iso === iso;
            return (
              <TouchableOpacity
                key={iso}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => handleSelect('iso', iso)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{iso}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filters / ND */}
      <View style={styles.section}>
        <Text style={styles.headerLbl}>FILTER / ND</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.filters.map((fil) => {
            const isSelected = form.filter === fil;
            return (
              <TouchableOpacity
                key={fil}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => handleSelect('filter', fil)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{fil}</Text>
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
    backgroundColor: '#17171C',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2D35',
    marginBottom: 14,
    gap: 10,
  },
  section: {
    gap: 4,
  },
  headerLbl: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#63656D',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: '#1F2026',
    borderWidth: 1,
    borderColor: '#2C2D35',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(255, 138, 61, 0.15)',
    borderColor: '#FF8A3D',
  },
  chipText: {
    color: '#9FA1A8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FF8A3D',
    fontWeight: '700',
  },
});
