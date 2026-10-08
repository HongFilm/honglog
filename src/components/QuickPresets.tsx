import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useHonglogStore } from '../store/useHonglogStore';
import { THEME, LIGHT_THEME, ThemeColors } from '../types';

const COMMON_FPS = ['24', '25', '30', '48', '50', '60', '120'];

export const QuickPresets: React.FC = () => {
  const {
    meta,
    form,
    setForm,
    toggleCamera,
    setCameraParam,
    isDarkMode,
  } = useHonglogStore();

  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;

  const selectedCams = form.selectedCameras && form.selectedCameras.length > 0
    ? form.selectedCameras
    : [form.camera];

  const isMultiCam = selectedCams.length > 1;

  // Active sub-tab for multi-cam configuration
  const [activeCamTarget, setActiveCamTarget] = useState<string>(selectedCams[0] || form.camera);
  const currentTarget = selectedCams.includes(activeCamTarget) ? activeCamTarget : selectedCams[0];

  const handleParamSelect = (
    param: 'card' | 'lens' | 'shutter' | 'iso' | 'filter' | 'fps',
    val: string
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isMultiCam) {
      setCameraParam(currentTarget, param, val);
    } else {
      setForm({ [param]: val });
    }
  };

  const currentTargetCard = isMultiCam
    ? form.cameraCards[currentTarget] || form.card
    : form.card;

  const currentTargetLens = isMultiCam
    ? form.cameraLenses[currentTarget] || form.lens
    : form.lens;

  const currentTargetShutter = isMultiCam
    ? form.cameraShutters[currentTarget] || form.shutter
    : form.shutter;

  const currentTargetIso = isMultiCam
    ? form.cameraIsos[currentTarget] || form.iso
    : form.iso;

  const currentTargetFilter = isMultiCam
    ? form.cameraFilters[currentTarget] || form.filter
    : form.filter;

  const currentTargetFps = isMultiCam
    ? form.cameraFps[currentTarget] || form.fps
    : form.fps;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Camera Selection - Multi-Cam Toggle */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>CAMERA (MULTI-CAM TOGGLE)</Text>
          {isMultiCam && (
            <View style={[styles.multiCamTag, { backgroundColor: theme.accentWash, borderColor: theme.accent }]}>
              <Text style={[styles.multiCamTagText, { color: theme.accent }]}>
                MULTI-CAM ({selectedCams.length} AKTIF)
              </Text>
            </View>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.cameras.map((cam) => {
            const isSelected = selectedCams.includes(cam);
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
                  setActiveCamTarget(cam);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {isSelected && <Feather name="check" size={13} color={theme.accent} />}
                  {cam}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Multi-Cam Sub-selector: Choose which camera to assign specs to */}
      {isMultiCam && (
        <View style={[styles.multiCamConfigBox, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
          <Text style={[styles.multiCamConfigTitle, { color: theme.textFaint }]}>
            PILIH KAMERA UNTUK DIKONFIGURASI SPESIFIKASINYA:
          </Text>
          <View style={styles.camTargetTabs}>
            {selectedCams.map((cam) => {
              const isActive = currentTarget === cam;
              const camCard = form.cameraCards[cam] || '-';
              const camLens = form.cameraLenses[cam] || form.lens || '-';
              const camFps = form.cameraFps[cam] || form.fps || '24';

              return (
                <TouchableOpacity
                  key={cam}
                  style={[
                    styles.camTargetTab,
                    { backgroundColor: theme.surface, borderColor: isActive ? theme.accent : theme.border },
                    isActive && { backgroundColor: theme.accentWash },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveCamTarget(cam);
                  }}
                >
                  <Text style={[styles.camTargetName, { color: isActive ? theme.accent : theme.textPrimary }]}>
                    {cam.split(' ')[0]} ({cam.split('(')[1]?.replace(')', '') || cam})
                  </Text>
                  <Text style={[styles.camTargetDetail, { color: theme.textSecondary }]}>
                    Roll: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{camCard}</Text> · Lens: <Text style={{ color: theme.accent, fontWeight: '700' }}>{camLens}mm</Text> · FPS: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{camFps}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Media Card / Roll */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>
            ROLL / CARD {isMultiCam ? `(UNTUK ${currentTarget})` : ''}
          </Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            NEXT: {form.clipName || '-'}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.cards.map((card) => {
            const isSelected = currentTargetCard === card;
            return (
              <TouchableOpacity
                key={card}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleParamSelect('card', card)}
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

      {/* Lens (Independent per camera in Multi-Cam) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>
            LENS (MM) {isMultiCam ? `(UNTUK ${currentTarget})` : ''}
          </Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            SET: {currentTargetLens}mm
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.lenses.map((lens) => {
            const isSelected = currentTargetLens === lens;
            return (
              <TouchableOpacity
                key={lens}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleParamSelect('lens', lens)}
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

      {/* Sensor FPS (Independent per camera in Multi-Cam - e.g. 24fps vs 60/120fps slow-mo) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>
            SENSOR FPS / HIGH SPEED {isMultiCam ? `(UNTUK ${currentTarget})` : ''}
          </Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            SET: {currentTargetFps} FPS
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {COMMON_FPS.map((f) => {
            const isSelected = currentTargetFps === f;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleParamSelect('fps', f)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {f} fps
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Shutter */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>
            SHUTTER {isMultiCam ? `(UNTUK ${currentTarget})` : ''}
          </Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            SET: {currentTargetShutter}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.shutters.map((sh) => {
            const isSelected = currentTargetShutter === sh;
            return (
              <TouchableOpacity
                key={sh}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleParamSelect('shutter', sh)}
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
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>
            SENSOR ISO {isMultiCam ? `(UNTUK ${currentTarget})` : ''}
          </Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            SET: ISO {currentTargetIso}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.isos.map((iso) => {
            const isSelected = currentTargetIso === iso;
            return (
              <TouchableOpacity
                key={iso}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleParamSelect('iso', iso)}
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
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>
            OPTICAL FILTER / ND {isMultiCam ? `(UNTUK ${currentTarget})` : ''}
          </Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            SET: {currentTargetFilter}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.filters.map((fil) => {
            const isSelected = currentTargetFilter === fil;
            return (
              <TouchableOpacity
                key={fil}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => handleParamSelect('filter', fil)}
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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  section: {
    gap: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLbl: {
    fontSize: 9.5,
    fontWeight: '800',
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
    letterSpacing: 0.5,
  },
  multiCamConfigBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  multiCamConfigTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  camTargetTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  camTargetTab: {
    flex: 1,
    minHeight: 52,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  camTargetName: {
    fontSize: 11,
    fontWeight: '800',
  },
  camTargetDetail: {
    fontSize: 9.5,
  },
  clipHintBadge: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    minHeight: 44,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
