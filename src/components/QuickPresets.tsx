import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useHonglogStore } from '../store/useHonglogStore';
import { THEME, LIGHT_THEME, ThemeColors } from '../types';

function parseCardPrefixAndNumber(card: string): { prefix: string; num: number; digits: number } {
  const match = (card || 'A001').trim().match(/^([A-Za-z]+)(\d+)$/);
  if (match) {
    return {
      prefix: match[1].toUpperCase(),
      num: parseInt(match[2], 10),
      digits: match[2].length,
    };
  }
  return { prefix: 'A', num: 1, digits: 3 };
}

function formatCard(prefix: string, num: number, digits: number = 3): string {
  return `${prefix.toUpperCase()}${String(num).padStart(digits, '0')}`;
}

function stepCardNumber(card: string, step: number): string {
  const { prefix, num, digits } = parseCardPrefixAndNumber(card);
  const nextNum = Math.max(num + step, 1);
  return formatCard(prefix, nextNum, digits);
}

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

  const [showCardModal, setShowCardModal] = useState(false);
  const [modalPrefix, setModalPrefix] = useState('A');
  const [customCardInput, setCustomCardInput] = useState('');

  const { prefix: currentPrefix, num: currentCardNum } = parseCardPrefixAndNumber(currentTargetCard);

  // Available camera prefixes for tabs (A, B, C, D...)
  const availablePrefixes = Array.from(
    new Set([
      'A',
      'B',
      'C',
      'D',
      ...meta.cameras.map((c) => c.charAt(0).toUpperCase()),
      currentPrefix,
    ])
  ).filter((p) => /^[A-Z]$/.test(p));

  // Quick card options to show in the horizontal row
  const quickCardOptions = Array.from(
    new Set([
      currentTargetCard,
      stepCardNumber(currentTargetCard, 1),
      stepCardNumber(currentTargetCard, 2),
      ...meta.cards,
      'A001',
      'B001',
      'C001',
      'D001',
    ])
  ).filter(Boolean).slice(0, 8);

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

      {/* Media Card / Roll with Dynamic Dropdown & Step Generator */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>
            ROLL / CARD {isMultiCam ? `(UNTUK ${currentTarget})` : ''}
          </Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            NEXT: {form.clipName || '-'}
          </Text>
        </View>

        {/* Card Active Stepper & Controls */}
        <View style={styles.cardControlRow}>
          <TouchableOpacity
            style={[styles.cardActiveDropdownBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.accent }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setModalPrefix(currentPrefix);
              setShowCardModal(true);
            }}
            activeOpacity={0.75}
          >
            <View style={styles.cardActiveInner}>
              <Text style={[styles.cardActivePrefix, { color: theme.textFaint }]}>ROLL:</Text>
              <Text style={[styles.cardActiveValue, { color: theme.accent }]}>{currentTargetCard}</Text>
            </View>
            <Feather name="chevron-down" size={14} color={theme.accent} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.cardStepperGroup}>
            <TouchableOpacity
              style={[styles.cardStepBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
              onPress={() => {
                const prev = stepCardNumber(currentTargetCard, -1);
                handleParamSelect('card', prev);
              }}
              activeOpacity={0.7}
            >
              <Feather name="minus" size={13} color={theme.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardNextStepBtn, { backgroundColor: theme.accentWash, borderColor: theme.accent }]}
              onPress={() => {
                const next = stepCardNumber(currentTargetCard, 1);
                handleParamSelect('card', next);
              }}
              activeOpacity={0.75}
            >
              <Feather name="plus" size={13} color={theme.accent} />
              <Text style={[styles.cardNextStepText, { color: theme.accent }]}>
                Next Roll ({stepCardNumber(currentTargetCard, 1)})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Horizontal Roll Shortcuts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {quickCardOptions.map((card) => {
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
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderLight }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setModalPrefix(currentPrefix);
              setShowCardModal(true);
            }}
          >
            <Feather name="grid" size={12} color={theme.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.chipText, { color: theme.accent }]}>Pilih Semua ▾</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lens (Independent per camera in Multi-Cam, supports multiple lenses) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.headerLbl, { color: theme.textFaint }]}>
            LENS (MM) {isMultiCam ? `(UNTUK ${currentTarget})` : ''}
          </Text>
          <Text style={[styles.clipHintBadge, { color: theme.accent }]}>
            SET: {currentTargetLens ? currentTargetLens.split(',').map((l) => l.trim().endsWith('mm') ? l.trim() : `${l.trim()}mm`).join(', ') : '-'}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {meta.lenses.map((lens) => {
            const currentLensList = (currentTargetLens || '')
              .split(/,\s*|\/\s*|\+\s*/)
              .map((l) => l.replace(/mm/gi, '').trim())
              .filter(Boolean);
            const isSelected = currentLensList.includes(lens);
            return (
              <TouchableOpacity
                key={lens}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.accentWash, borderColor: theme.accent },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  let updatedList: string[];
                  if (isSelected) {
                    updatedList = currentLensList.filter((l) => l !== lens);
                    if (updatedList.length === 0) updatedList = [lens];
                  } else {
                    updatedList = [...currentLensList, lens];
                  }
                  const newLensStr = updatedList.join(', ');
                  if (isMultiCam) {
                    setCameraParam(currentTarget, 'lens', newLensStr);
                  } else {
                    setForm({ lens: newLensStr });
                  }
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

      {/* Roll / Media Card Picker Modal Sheet */}
      <Modal
        visible={showCardModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCardModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.cardModalOverlay}
        >
          {/* Backdrop Tap to Close - Klik di luar modal langsung menutup */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCardModal(false);
            }}
          />

          <View style={[styles.cardModalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Modal Header */}
            <View style={styles.cardModalHeader}>
              <View>
                <Text style={[styles.cardModalTitle, { color: theme.textPrimary }]}>
                  PILIH ROLL / MEDIA CARD
                </Text>
                <Text style={[styles.cardModalSubtitle, { color: theme.textSecondary }]}>
                  Roll aktif: <Text style={{ color: theme.accent, fontWeight: '800' }}>{currentTargetCard}</Text> &bull; Bebas pilih untuk kamera mana saja
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                onPress={() => setShowCardModal(false)}
              >
                <Feather name="x" size={17} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Camera Prefix Filter Tabs (ROLL A, ROLL B, ROLL C, ROLL D...) */}
            <View style={styles.camPrefixTabs}>
              {availablePrefixes.map((pfx) => {
                const isPfxActive = modalPrefix === pfx;
                return (
                  <TouchableOpacity
                    key={pfx}
                    style={[
                      styles.camPrefixTab,
                      {
                        backgroundColor: isPfxActive ? theme.accentWash : theme.surfaceRaised,
                        borderColor: isPfxActive ? theme.accent : theme.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setModalPrefix(pfx);
                    }}
                  >
                    <Text
                      style={[
                        styles.camPrefixTabText,
                        { color: isPfxActive ? theme.accent : theme.textSecondary },
                      ]}
                    >
                      ROLL {pfx}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Grid of 20 Cards for the Active Prefix */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>
              <View style={styles.cardGrid}>
                {Array.from({ length: 20 }, (_, idx) => {
                  const cardVal = formatCard(modalPrefix, idx + 1);
                  const isCur = currentTargetCard === cardVal;
                  return (
                    <TouchableOpacity
                      key={cardVal}
                      style={[
                        styles.cardGridItem,
                        {
                          backgroundColor: isCur ? theme.accent : theme.surfaceRaised,
                          borderColor: isCur ? theme.accent : theme.border,
                        },
                      ]}
                      onPress={() => {
                        handleParamSelect('card', cardVal);
                        setShowCardModal(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.cardGridItemText,
                          { color: isCur ? '#FFF' : theme.textPrimary },
                        ]}
                      >
                        {cardVal}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Custom Card Input Row */}
            <View style={[styles.customCardBox, { borderTopColor: theme.border }]}>
              <TextInput
                style={[
                  styles.customCardInput,
                  {
                    backgroundColor: theme.surfaceRaised,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Custom Roll (cth: DRONE01, RAW01)..."
                placeholderTextColor={theme.textFaint}
                value={customCardInput}
                onChangeText={setCustomCardInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.customCardApplyBtn, { backgroundColor: theme.accent }]}
                onPress={() => {
                  if (customCardInput.trim()) {
                    handleParamSelect('card', customCardInput.trim().toUpperCase());
                    setCustomCardInput('');
                    setShowCardModal(false);
                  }
                }}
              >
                <Text style={styles.customCardApplyText}>Gunakan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  cardControlRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  cardActiveDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  cardActiveInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActivePrefix: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardActiveValue: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
  },
  cardStepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cardStepBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNextStepBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  cardNextStepText: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Card Picker Modal Styles
  cardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  cardModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    maxHeight: '80%',
    gap: 12,
  },
  cardModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardModalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camPrefixTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  camPrefixTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  camPrefixTabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  cardGridItem: {
    width: '23%',
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGridItemText: {
    fontSize: 12.5,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
  },
  customCardBox: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  customCardInput: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12.5,
  },
  customCardApplyBtn: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCardApplyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
