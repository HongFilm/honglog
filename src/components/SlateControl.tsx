import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useHonglogStore } from '../store/useHonglogStore';
import { THEME, LIGHT_THEME, ThemeColors } from '../types';

export const SlateControl: React.FC = () => {
  const {
    form,
    setForm,
    incrementSlate,
    incrementTake,
    addSuffixToScene,
    addSuffixToShot,
    stripSuffixScene,
    addTake,
    takes,
    selectedDay,
    setSelectedDay,
    isDarkMode,
  } = useHonglogStore();

  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const stepAlphaNum = (val: string, delta: number) => {
    const num = parseInt(val) || 1;
    return String(Math.max(1, num + delta));
  };

  const handleSave = () => {
    haptic();
    const statusLabel = form.takeStatus || 'HOLD';
    const locLight = `${form.intExt || 'INT'} · ${form.dayNight || 'DAY'}`;
    const clipInfo = form.clipName ? `Clip: ${form.clipName}` : '';
    const details = [
      `Status: ${statusLabel}`,
      `Environment: ${locLight}`,
      clipInfo,
    ].filter(Boolean).join('\n');

    Alert.alert(
      'Simpan Take?',
      `SLATE ${form.slate}  ·  SCENE ${form.scene}  ·  SHOT ${form.shot}  ·  TAKE ${form.take}\n\n${details}`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'SIMPAN',
          style: 'default',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await addTake();
          },
        },
      ]
    );
  };

  const dayTakes = takes.filter((t) => t.day === selectedDay);

  const renderStepper = (
    label: string,
    value: string,
    onMinus: () => void,
    onPlus: () => void,
    onChange: (text: string) => void,
    numeric: boolean,
    accent: boolean
  ) => {
    const valLen = value.length;
    const dynamicFontSize = valLen >= 4 ? 13 : valLen === 3 ? 15 : 18;

    return (
      <View style={styles.stepperCol}>
        <Text style={[styles.stepperLabel, { color: accent ? theme.accent : theme.textSecondary }]}>
          {label}
        </Text>
        <View
          style={[
            styles.stepperBox,
            {
              backgroundColor: theme.surfaceRaised,
              borderColor: accent ? theme.accent : theme.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.stepperBtn, { backgroundColor: theme.surface }]}
            onPress={() => {
              haptic();
              onMinus();
            }}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={15} color={theme.accent} />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.stepperInput,
              {
                color: accent ? theme.accent : theme.textPrimary,
                fontSize: dynamicFontSize,
              },
            ]}
            keyboardType={numeric ? 'numeric' : 'default'}
            autoCapitalize="characters"
            value={value}
            onChangeText={onChange}
            multiline={false}
            numberOfLines={1}
            scrollEnabled={false}
            maxFontSizeMultiplier={1.1}
          />

          <TouchableOpacity
            style={[styles.stepperBtn, { backgroundColor: theme.surface }]}
            onPress={() => {
              haptic();
              onPlus();
            }}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={15} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* DAY Selector + mini stats */}
      <View style={styles.dayRow}>
        <View style={[styles.dayStepper, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
          <TouchableOpacity
            style={styles.dayBtn}
            onPress={() => {
              haptic();
              setSelectedDay(Math.max(1, selectedDay - 1));
            }}
          >
            <Feather name="chevron-left" size={20} color={theme.accent} />
          </TouchableOpacity>
          <View style={styles.dayLabelWrap}>
            <Text style={[styles.dayLabel, { color: theme.textPrimary }]}>DAY {selectedDay}</Text>
            <Text style={[styles.daySub, { color: theme.textFaint }]}>{dayTakes.length} take hari ini</Text>
          </View>
          <TouchableOpacity
            style={styles.dayBtn}
            onPress={() => {
              haptic();
              setSelectedDay(selectedDay + 1);
            }}
          >
            <Feather name="chevron-right" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <View style={[styles.clipPill, { backgroundColor: theme.accentWash, borderColor: theme.accent }]}>
          <Text style={[styles.clipPillLbl, { color: theme.textFaint }]}>NEXT CLIP</Text>
          <Text style={[styles.clipPillVal, { color: theme.accent }]} numberOfLines={1}>
            {form.clipName || '-'}
          </Text>
        </View>
      </View>

      {/* Clapperboard Big Display */}
      <View style={[styles.clapper, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderLight }]}>
        {/* Clapper stripes */}
        <View style={styles.stripeRow}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stripe,
                { backgroundColor: i % 2 === 0 ? theme.textPrimary : theme.bg },
              ]}
            />
          ))}
        </View>
        <View style={styles.clapperBody}>
          <Text style={[styles.bigReadout, { color: theme.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
            {form.scene}
            <Text style={{ color: theme.textFaint }}> / </Text>
            {form.shot}
            <Text style={{ color: theme.accent }}>  ·  TK {form.take}</Text>
          </Text>
          <Text style={[styles.bigReadoutLbl, { color: theme.textFaint }]}>
            SLATE {form.slate} · SCENE / SHOT / TAKE
          </Text>
          {form.selectedCameras && form.selectedCameras.length > 1 && (
            <View style={[styles.multiCamPill, { backgroundColor: theme.accentWash, borderColor: theme.accent }]}>
              <Text style={[styles.multiCamPillText, { color: theme.accent }]}>
                MULTI-CAM: {form.selectedCameras.map((c) => c.split(' ')[0]).join(' + ')} ({form.selectedCameras.length} CAM)
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 2x2 Grid Stepper: Baris 1 (SLATE & SCENE) */}
      <View style={styles.gridRow2x2}>
        {renderStepper(
          'SLATE',
          String(form.slate),
          () => incrementSlate(-1),
          () => incrementSlate(1),
          (t) => setForm({ slate: parseInt(t) || 1 }),
          true,
          false
        )}
        {renderStepper(
          'SCENE',
          form.scene,
          () => setForm({ scene: stepAlphaNum(form.scene, -1) }),
          () => setForm({ scene: stepAlphaNum(form.scene, 1) }),
          (t) => setForm({ scene: t }),
          false,
          false
        )}
      </View>

      {/* Suffix Shortcuts untuk SCENE */}
      <View style={styles.suffixBar}>
        <Text style={[styles.suffixLbl, { color: theme.textFaint }]}>SCENE:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
          {['A', 'B', 'C', 'D'].map((s) => (
            <TouchableOpacity
              key={`sc_${s}`}
              style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderLight }]}
              onPress={() => {
                haptic();
                addSuffixToScene(s);
              }}
            >
              <Text style={[styles.chipText, { color: theme.accent }]}>SC+{s}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.chip, { borderColor: theme.borderLight, backgroundColor: 'transparent' }]}
            onPress={() => {
              haptic();
              setForm({ scene: form.scene.replace(/[^0-9]/g, '') || '1' });
            }}
          >
            <Text style={[styles.chipClearText, { color: theme.textSecondary }]}>Reset</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 2x2 Grid Stepper: Baris 2 (SHOT & TAKE) */}
      <View style={[styles.gridRow2x2, { marginTop: 12 }]}>
        {renderStepper(
          'SHOT',
          form.shot,
          () => setForm({ shot: stepAlphaNum(form.shot, -1) }),
          () => setForm({ shot: stepAlphaNum(form.shot, 1) }),
          (t) => setForm({ shot: t }),
          false,
          false
        )}
        {renderStepper(
          'TAKE',
          String(form.take),
          () => incrementTake(-1),
          () => incrementTake(1),
          (t) => setForm({ take: parseInt(t) || 1 }),
          true,
          true
        )}
      </View>

      {/* Suffix Shortcuts untuk SHOT */}
      <View style={styles.suffixBar}>
        <Text style={[styles.suffixLbl, { color: theme.textFaint }]}>SHOT:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
          {['A', 'B', 'C', 'D'].map((s) => (
            <TouchableOpacity
              key={`sh_${s}`}
              style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderLight }]}
              onPress={() => {
                haptic();
                addSuffixToShot(s);
              }}
            >
              <Text style={[styles.chipText, { color: theme.accent }]}>SH+{s}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.chip, { borderColor: theme.borderLight, backgroundColor: 'transparent' }]}
            onPress={() => {
              haptic();
              setForm({ shot: form.shot.replace(/[^0-9]/g, '') || '1' });
            }}
          >
            <Text style={[styles.chipClearText, { color: theme.textSecondary }]}>Reset</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Environment: INT/EXT and DAY/NIGHT Row */}
      <View style={styles.envRow}>
        <View style={styles.envGroup}>
          <Text style={[styles.suffixLbl, { color: theme.textFaint }]}>LOC:</Text>
          {(['INT', 'EXT'] as const).map((loc) => {
            const isCur = (form.intExt || 'INT') === loc;
            return (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.envBtn,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isCur && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => {
                  haptic();
                  setForm({ intExt: loc });
                }}
              >
                <Text style={[styles.envBtnText, { color: isCur ? theme.accent : theme.textSecondary }, isCur && { fontWeight: '800' }]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.envGroup}>
          <Text style={[styles.suffixLbl, { color: theme.textFaint }]}>LIGHT:</Text>
          {(['DAY', 'NIGHT'] as const).map((dn) => {
            const isCur = (form.dayNight || 'DAY') === dn;
            return (
              <TouchableOpacity
                key={dn}
                style={[
                  styles.envBtn,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isCur && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => {
                  haptic();
                  setForm({ dayNight: dn });
                }}
              >
                <Text style={[styles.envBtnText, { color: isCur ? theme.accent : theme.textSecondary }, isCur && { fontWeight: '800' }]}>
                  {dn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Clip Name & T-Stop */}
      <View style={styles.clipRow}>
        <View style={[styles.clipField, { flex: 1.5 }]}>
          <Text style={[styles.subLbl, { color: theme.textFaint }]}>CLIP NAME</Text>
          <TextInput
            style={[styles.clipInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
            value={form.clipName}
            onChangeText={(t) => setForm({ clipName: t })}
            placeholder="A001_001"
            placeholderTextColor={theme.textFaint}
          />
        </View>
        <View style={[styles.clipField, { flex: 1 }]}>
          <Text style={[styles.subLbl, { color: theme.textFaint }]}>T-STOP / APERTURE</Text>
          <TextInput
            style={[styles.clipInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
            value={form.tstop}
            onChangeText={(t) => setForm({ tstop: t })}
            placeholder="2.8"
            placeholderTextColor={theme.textFaint}
          />
        </View>
      </View>

      {/* Notes */}
      <View style={styles.notesWrap}>
        <Text style={[styles.subLbl, { color: theme.textFaint }]}>CATATAN / REMARKS</Text>
        <TextInput
          style={[styles.notesInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
          value={form.notes}
          onChangeText={(t) => setForm({ notes: t })}
          placeholder="Cth: Focus aman, talent senyum, boom in frame"
          placeholderTextColor={theme.textFaint}
        />
      </View>

      {/* Take Status (PRINT / HOLD / NG) & Save Row */}
      <View style={styles.actionRow}>
        <View style={styles.statusToggleGroup}>
          {(['PRINT', 'HOLD', 'NG'] as const).map((st) => {
            const isSelected = (form.takeStatus || (form.isGood ? 'PRINT' : 'HOLD')) === st;
            const statusColor = st === 'PRINT' ? theme.good : st === 'NG' ? theme.danger : theme.textSecondary;
            return (
              <TouchableOpacity
                key={st}
                style={[
                  styles.statusToggleBtn,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && {
                    borderColor: statusColor,
                    backgroundColor: st === 'PRINT' ? 'rgba(74, 222, 128, 0.15)' : st === 'NG' ? 'rgba(255, 107, 107, 0.15)' : theme.accentWash,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  useHonglogStore.getState().setTakeStatus(st);
                }}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    { color: isSelected ? statusColor : theme.textFaint },
                    isSelected && { fontWeight: '800' },
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>SIMPAN TAKE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dayStepper: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dayBtn: {
    width: 44,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBtnText: {
    fontSize: 22,
    fontWeight: '700',
  },
  dayLabelWrap: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
    letterSpacing: 1,
  },
  daySub: {
    fontSize: 9.5,
    marginTop: 1,
  },
  clipPill: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  clipPillLbl: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  clipPillVal: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
    marginTop: 1,
  },
  clapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  stripeRow: {
    flexDirection: 'row',
    height: 16,
  },
  stripe: {
    flex: 1,
    transform: [{ skewX: '-20deg' }],
  },
  clapperBody: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  bigReadout: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
    letterSpacing: 1,
  },
  bigReadoutLbl: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  multiCamPill: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  multiCamPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gridRow2x2: {
    flexDirection: 'row',
    gap: 12,
  },
  stepperCol: {
    flex: 1,
  },
  stepperLabel: {
    fontFamily: THEME.fontMono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  stepperBox: {
    borderRadius: 12,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 38,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperInput: {
    flex: 1,
    height: 48,
    textAlign: 'center',
    fontWeight: '800',
    fontFamily: THEME.fontMono,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  suffixBar: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suffixLbl: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    width: 50,
  },
  chipsWrap: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingRight: 6,
  },
  chip: {
    minHeight: 30,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipClearText: {
    fontSize: 11,
    fontWeight: '600',
  },
  envRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  envGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  envBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  envBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clipInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    fontWeight: '600',
  },
  notesWrap: {
    marginTop: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statusToggleGroup: {
    flex: 1.2,
    flexDirection: 'row',
    gap: 6,
  },
  statusToggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggleText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  saveBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
