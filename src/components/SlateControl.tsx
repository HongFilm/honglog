import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
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
    toggleGoodTake,
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

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTake();
  };

  const dayTakes = takes.filter((t) => t.day === selectedDay);

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
            <Text style={[styles.dayBtnText, { color: theme.accent }]}>‹</Text>
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
            <Text style={[styles.dayBtnText, { color: theme.accent }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.clipPill, { backgroundColor: theme.accentWash, borderColor: theme.accent }]}>
          <Text style={[styles.clipPillLbl, { color: theme.textFaint }]}>NEXT CLIP</Text>
          <Text style={[styles.clipPillVal, { color: theme.accent }]} numberOfLines={1}>
            {form.clipName || '—'}
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

      {/* 4-Column Stepper: Slate, Scene, Shot, Take */}
      <View style={styles.grid}>
        {(
          [
            { label: 'SLATE', value: String(form.slate), onMinus: () => incrementSlate(-1), onPlus: () => incrementSlate(1), onChange: (t: string) => setForm({ slate: parseInt(t) || 1 }), numeric: true, accent: false },
            { label: 'SCENE', value: form.scene, onMinus: () => setForm({ scene: stepAlphaNum(form.scene, -1) }), onPlus: () => setForm({ scene: stepAlphaNum(form.scene, 1) }), onChange: (t: string) => setForm({ scene: t }), numeric: false, accent: false },
            { label: 'SHOT', value: form.shot, onMinus: () => setForm({ shot: stepAlphaNum(form.shot, -1) }), onPlus: () => setForm({ shot: stepAlphaNum(form.shot, 1) }), onChange: (t: string) => setForm({ shot: t }), numeric: false, accent: false },
            { label: 'TAKE', value: String(form.take), onMinus: () => incrementTake(-1), onPlus: () => incrementTake(1), onChange: (t: string) => setForm({ take: parseInt(t) || 1 }), numeric: true, accent: true },
          ] as const
        ).map((c) => (
          <View style={styles.col} key={c.label}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{c.label}</Text>
            <View style={[styles.stepper, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: theme.surface }]}
                onPress={() => {
                  haptic();
                  c.onMinus();
                }}
              >
                <Text style={[styles.stepBtnText, { color: theme.accent }]}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.valInput, { color: c.accent ? theme.accent : theme.textPrimary }]}
                keyboardType={c.numeric ? 'numeric' : 'default'}
                autoCapitalize="characters"
                value={c.value}
                onChangeText={c.onChange}
              />
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: theme.surface }]}
                onPress={() => {
                  haptic();
                  c.onPlus();
                }}
              >
                <Text style={[styles.stepBtnText, { color: theme.accent }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Suffix Shortcuts */}
      <View style={styles.suffixRow}>
        <Text style={[styles.suffixLbl, { color: theme.textFaint }]}>SUFFIX</Text>
        <View style={styles.chipsWrap}>
          {['A', 'B', 'C', 'D'].map((s) => (
            <TouchableOpacity
              key={s}
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
            style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderLight }]}
            onPress={() => {
              haptic();
              addSuffixToShot('A');
            }}
          >
            <Text style={[styles.chipText, { color: theme.accent }]}>SH+A</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, { borderColor: theme.borderLight, backgroundColor: 'transparent' }]}
            onPress={() => {
              haptic();
              stripSuffixScene();
            }}
          >
            <Text style={[styles.chipClearText, { color: theme.textSecondary }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Clip Name & T-Stop */}
      <View style={styles.clipRow}>
        <View style={styles.clipField}>
          <Text style={[styles.subLbl, { color: theme.textFaint }]}>CLIP NAME</Text>
          <TextInput
            style={[styles.clipInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
            value={form.clipName}
            onChangeText={(t) => setForm({ clipName: t })}
            placeholder="A001_001"
            placeholderTextColor={theme.textFaint}
          />
        </View>
        <View style={styles.clipField}>
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
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
    width: 38,
    height: 48,
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
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
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
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  stripeRow: {
    flexDirection: 'row',
    height: 14,
  },
  stripe: {
    flex: 1,
    transform: [{ skewX: '-20deg' }],
  },
  clapperBody: {
    alignItems: 'center',
    paddingVertical: 14,
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
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  stepper: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stepBtn: {
    width: 26,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  valInput: {
    flex: 1,
    height: 42,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: THEME.fontMono,
    padding: 0,
  },
  suffixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 2,
  },
  suffixLbl: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  chipsWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chipClearText: {
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
