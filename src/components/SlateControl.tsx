import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from '../store/useHonglogStore';

import { THEME } from '../types';

export const SlateControl: React.FC = () => {
  const {
    form,
    setForm,
    incrementSlate,
    incrementTake,
    addSuffixToScene,
    addSuffixToShot,
    stripSuffixScene,
    toggleGoodTake,
    addTake,
  } = useHonglogStore();

  const handleSlateDelta = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    incrementSlate(delta);
  };

  const handleTakeDelta = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    incrementTake(delta);
  };

  const handleSuffix = (type: 'scene' | 'shot', suffix: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'scene') addSuffixToScene(suffix);
    else addSuffixToShot(suffix);
  };

  const handleStrip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stripSuffixScene();
  };

  const handleToggleGood = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleGoodTake();
  };

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTake();
  };

  return (
    <View style={styles.container}>
      {/* Brand Logo & Header */}
      <View style={styles.brandHeader}>
        <Image source={require('../../assets/logo.jpeg')} style={styles.logoImage} resizeMode="contain" />
        <View>
          <Text style={styles.brandTitle}>HONGLOG</Text>
          <Text style={styles.brandSub}>CAMERA REPORT & SLATE LOG</Text>
        </View>
      </View>

      {/* 4-Column Stepper: Slate, Scene, Shot, Take */}
      <View style={styles.grid}>
        {/* SLATE */}
        <View style={styles.col}>
          <Text style={styles.label}>SLATE</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => handleSlateDelta(-1)}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.valInput}
              keyboardType="numeric"
              value={String(form.slate)}
              onChangeText={(t) => setForm({ slate: parseInt(t) || 1 })}
            />
            <TouchableOpacity style={styles.stepBtn} onPress={() => handleSlateDelta(1)}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SCENE */}
        <View style={styles.col}>
          <Text style={styles.label}>SCENE</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                const num = parseInt(form.scene) || 1;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setForm({ scene: String(Math.max(1, num - 1)) });
              }}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.valInput}
              value={form.scene}
              autoCapitalize="characters"
              onChangeText={(t) => setForm({ scene: t })}
            />
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                const num = parseInt(form.scene) || 1;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setForm({ scene: String(num + 1) });
              }}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SHOT */}
        <View style={styles.col}>
          <Text style={styles.label}>SHOT</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                const num = parseInt(form.shot) || 1;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setForm({ shot: String(Math.max(1, num - 1)) });
              }}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.valInput}
              value={form.shot}
              autoCapitalize="characters"
              onChangeText={(t) => setForm({ shot: t })}
            />
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                const num = parseInt(form.shot) || 1;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setForm({ shot: String(num + 1) });
              }}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TAKE */}
        <View style={styles.col}>
          <Text style={styles.label}>TAKE</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => handleTakeDelta(-1)}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.valInput, styles.takeInputHighlight]}
              keyboardType="numeric"
              value={String(form.take)}
              onChangeText={(t) => setForm({ take: parseInt(t) || 1 })}
            />
            <TouchableOpacity style={styles.stepBtn} onPress={() => handleTakeDelta(1)}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Suffix Shortcuts */}
      <View style={styles.suffixRow}>
        <Text style={styles.suffixLbl}>Suffix Scene:</Text>
        <View style={styles.chipsWrap}>
          {['A', 'B', 'C', 'D'].map((s) => (
            <TouchableOpacity key={s} style={styles.chip} onPress={() => handleSuffix('scene', s)}>
              <Text style={styles.chipText}>+{s}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.chip, styles.chipClear]} onPress={handleStrip}>
            <Text style={styles.chipClearText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Clip Name & Card Info */}
      <View style={styles.clipRow}>
        <View style={styles.clipField}>
          <Text style={styles.subLbl}>CLIP NAME</Text>
          <TextInput
            style={styles.clipInput}
            value={form.clipName}
            onChangeText={(t) => setForm({ clipName: t })}
            placeholder="A001_001"
            placeholderTextColor="#52525b"
          />
        </View>
        <View style={styles.clipField}>
          <Text style={styles.subLbl}>T-STOP / APERTURE</Text>
          <TextInput
            style={styles.clipInput}
            value={form.tstop}
            onChangeText={(t) => setForm({ tstop: t })}
            placeholder="2.8"
            placeholderTextColor="#52525b"
          />
        </View>
      </View>

      {/* Notes / Remarks */}
      <View style={styles.notesWrap}>
        <Text style={styles.subLbl}>CATATAN / REMARKS</Text>
        <TextInput
          style={styles.notesInput}
          value={form.notes}
          onChangeText={(t) => setForm({ notes: t })}
          placeholder="Cth: Focus aman, talent senyum, boom in frame"
          placeholderTextColor="#52525b"
        />
      </View>

      {/* Good Take & Action Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.goodToggle, form.isGood && styles.goodToggleActive]}
          onPress={handleToggleGood}
          activeOpacity={0.8}
        >
          <Text style={[styles.goodIcon, form.isGood && styles.goodIconActive]}>★</Text>
          <Text style={[styles.goodText, form.isGood && styles.goodTextActive]}>
            {form.isGood ? 'GOOD TAKE ⭐' : 'Tandai Good Take'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>SIMPAN TAKE ❯</Text>
        </TouchableOpacity>
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
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  logoImage: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textPrimary,
    fontFamily: THEME.fontDisplay,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '600',
    color: THEME.accent,
    fontFamily: THEME.fontMono,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
  },
  label: {
    fontFamily: THEME.fontMono,
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textSecondary,
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  stepper: {
    backgroundColor: THEME.surfaceRaised,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stepBtn: {
    width: 26,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.surface,
  },
  stepBtnText: {
    color: THEME.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  valInput: {
    flex: 1,
    height: 42,
    color: THEME.textPrimary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: THEME.fontMono,
    padding: 0,
  },
  takeInputHighlight: {
    color: THEME.accent,
  },
  suffixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 2,
  },
  suffixLbl: {
    fontSize: 11,
    color: THEME.textFaint,
  },
  chipsWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: THEME.surfaceRaised,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  chipText: {
    color: THEME.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  chipClear: {
    backgroundColor: 'transparent',
    borderColor: THEME.borderLight,
  },
  chipClearText: {
    color: THEME.textSecondary,
    fontSize: 11,
  },
  clipRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  clipField: {
    flex: 1,
  },
  subLbl: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.textFaint,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clipInput: {
    backgroundColor: THEME.surfaceRaised,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  notesWrap: {
    marginTop: 10,
  },
  notesInput: {
    backgroundColor: THEME.surfaceRaised,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: THEME.textPrimary,
    fontSize: 12.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  goodToggle: {
    flex: 1.1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: THEME.border,
    backgroundColor: THEME.surfaceRaised,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  goodToggleActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: THEME.good,
  },
  goodIcon: {
    fontSize: 16,
    color: THEME.textFaint,
  },
  goodIconActive: {
    color: THEME.good,
  },
  goodText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  goodTextActive: {
    color: THEME.good,
  },
  saveBtn: {
    flex: 1.3,
    height: 44,
    borderRadius: 10,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
