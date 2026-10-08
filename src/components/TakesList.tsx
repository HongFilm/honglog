import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useHonglogStore } from '../store/useHonglogStore';
import { TakeEntry, THEME, LIGHT_THEME, ThemeColors } from '../types';

export const TakesList: React.FC = () => {
  const { takes, deleteTake, updateTake, meta, isDarkMode } = useHonglogStore();
  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;

  const [filterGood, setFilterGood] = useState(false);
  const [filterDay, setFilterDay] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<TakeEntry | null>(null);

  const [picker, setPicker] = useState<{
    title: string;
    options: string[];
    currentValue: string;
    onSelect: (val: string) => void;
  } | null>(null);

  const standardTstops = ['1.4', '1.8', '2.0', '2.8', '4.0', '5.6', '8.0', '11', '16', '22'];
  const standardFps = ['23.976', '24', '25', '29.97', '48', '50', '59.94', '60', '100', '120'];
  const lensOptions = meta.lenses.length > 0 ? meta.lenses : ['18', '24', '35', '50', '85', '100', '135'];
  const shutterOptions = meta.shutters.length > 0 ? meta.shutters : ['180°', '90°', '45°', '1/48', '1/50', '1/100', '1/120'];
  const isoOptions = meta.isos.length > 0 ? meta.isos : ['100', '200', '400', '800', '1600', '3200', '6400', '12800'];
  const filterOptions = meta.filters.length > 0 ? meta.filters : ['Clear', 'ND.3', 'ND.6', 'ND.9', 'ND 1.2', 'Polarizer', 'Diffusion 1/4'];
  const cardOptions = meta.cards.length > 0 ? meta.cards : ['A001', 'A002', 'B001', 'B002'];
  const cameraOptions = meta.cameras.length > 0 ? meta.cameras : ['A', 'B', 'C', 'D'];

  const days = useMemo(
    () => Array.from(new Set(takes.map((t) => t.day))).sort((a, b) => b - a),
    [takes]
  );

  const sections = useMemo(() => {
    const filtered = takes.filter((t) => {
      if (filterGood && !t.isGood) return false;
      if (filterDay !== null && t.day !== filterDay) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.scene.toLowerCase().includes(q) ||
          t.shot.toLowerCase().includes(q) ||
          (t.clipName || '').toLowerCase().includes(q) ||
          (t.notes || '').toLowerCase().includes(q) ||
          (t.card || '').toLowerCase().includes(q) ||
          (t.camera || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

    const byDay = new Map<number, TakeEntry[]>();
    filtered.forEach((t) => {
      const arr = byDay.get(t.day) || [];
      arr.push(t);
      byDay.set(t.day, arr);
    });

    return Array.from(byDay.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([day, data]) => ({ title: `DAY ${day}`, day, data }));
  }, [takes, filterGood, filterDay, search]);

  const handleDelete = (id: string, label: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Hapus Take', `Yakin hapus ${label}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await deleteTake(id);
          setEditing(null);
        },
      },
    ]);
  };

  const handleToggleStar = (t: TakeEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateTake(t.id, { isGood: !t.isGood });
  };

  const renderDropdownField = (
    label: string,
    value: string,
    options: string[],
    onSelect: (val: string) => void,
    config?: { suffix?: string; prefix?: string; placeholder?: string; flex?: number }
  ) => {
    const prefix = config?.prefix || '';
    const suffix = config?.suffix || '';
    const displayVal = value ? `${prefix}${value}${suffix}` : (config?.placeholder || 'Pilih...');
    return (
      <View style={[styles.modalField, config?.flex !== undefined ? { flex: config.flex } : null]}>
        <Text style={[styles.subLbl, { color: theme.textFaint }]}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setPicker({
              title: label,
              options,
              currentValue: value,
              onSelect,
            });
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dropdownValue,
              { color: value ? theme.textPrimary : theme.textFaint },
            ]}
            numberOfLines={1}
          >
            {displayVal}
          </Text>
          <Feather name="chevron-down" size={13} color={theme.accent} />
        </TouchableOpacity>
      </View>
    );
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      let payload = { ...editing };
      if (payload.cameras && payload.cameras.length > 1) {
        payload.camera = payload.cameras.map((c) => c.camera.split(' ')[0]).join(' ');
        payload.card = payload.cameras.map((c) => c.card).join(' ');
        payload.clipName = payload.cameras.map((c) => c.clipName || '').join(' ');
        payload.lens = payload.cameras.map((c) => (c.lens ? `${c.lens}mm` : '-')).join(' ');
        payload.tstop = payload.cameras.map((c) => (c.tstop ? `T${c.tstop}` : '-')).join(' ');
        payload.shutter = payload.cameras.map((c) => c.shutter || '').join(' ');
        payload.iso = payload.cameras.map((c) => c.iso || '').join(' ');
        payload.filter = payload.cameras.map((c) => c.filter || '').join(' ');
        payload.fps = payload.cameras.map((c) => c.fps || '').join(' ');
      }
      await updateTake(editing.id, payload);
      setEditing(null);
      Alert.alert('Sukses', 'Perubahan take berhasil disimpan!');
    } catch (e) {
      console.error(e);
      Alert.alert('Gagal', 'Gagal menyimpan perubahan take.');
    }
  };

  const renderItem = ({ item }: { item: TakeEntry }) => {
    const isMultiCam = item.cameras && item.cameras.length > 1;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: item.isGood ? theme.good : theme.border },
          item.isGood && { backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.05)' : 'rgba(34, 197, 94, 0.05)' },
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.slateBadge, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderLight }]}>
            <Text style={[styles.slateBadgeText, { color: theme.accent }]}>
              SLATE {item.slate} · SC {item.scene} · SH {item.shot} · TK {item.take}
              {item.intExt ? ` · ${item.intExt}` : ''}
              {item.dayNight ? ` · ${item.dayNight}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleToggleStar(item)}
            style={styles.starBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather
                name={item.isGood ? 'check-circle' : 'circle'}
                size={13}
                color={item.isGood ? theme.good : theme.textFaint}
              />
              <Text style={[styles.starIcon, { color: item.isGood ? theme.good : theme.textFaint }]}>
                {item.status || (item.isGood ? 'PRINT' : 'HOLD')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Multi-Cam Indicator if applicable */}
        {isMultiCam && item.cameras && (
          <View style={[styles.multiCamContainer, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
            <Text style={[styles.multiCamTitle, { color: theme.accent }]}>
              MULTI-CAM ({item.cameras.length} CAM):
            </Text>
            {item.cameras.map((c, idx) => (
              <View key={idx} style={styles.multiCamItemRow}>
                <Text style={[styles.multiCamTag, { color: theme.textPrimary }]}>
                  {c.camera}:
                </Text>
                <Text style={[styles.multiCamRollClip, { color: theme.textSecondary }]}>
                  Roll <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{c.card}</Text> · Lens <Text style={{ color: theme.accent, fontWeight: '700' }}>{c.lens ? `${c.lens}mm` : '-'}</Text> · FPS <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{c.fps || item.fps || '24'}</Text> · Clip <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{c.clipName}</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Single Camera Specs */}
        {!isMultiCam && (
          <View style={styles.cardSpecs}>
            <Text style={[styles.specItem, { color: theme.textPrimary }]}>
              <Text style={[styles.specKey, { color: theme.textFaint }]}>CAM </Text>
              {item.camera || 'A'}
            </Text>
            <Text style={[styles.specItem, { color: theme.textPrimary }]}>
              <Text style={[styles.specKey, { color: theme.textFaint }]}>ROLL </Text>
              {item.card}
            </Text>
            <Text style={[styles.specItem, { color: theme.textPrimary }]}>
              <Text style={[styles.specKey, { color: theme.textFaint }]}>LENS </Text>
              {item.lens ? `${item.lens}mm` : '-'}
            </Text>
            <Text style={[styles.specItem, { color: theme.textPrimary }]}>
              <Text style={[styles.specKey, { color: theme.textFaint }]}>T-STOP </Text>
              {item.tstop || '-'}
            </Text>
            <Text style={[styles.specItem, { color: theme.textPrimary }]}>
              <Text style={[styles.specKey, { color: theme.textFaint }]}>ISO </Text>
              {item.iso}
            </Text>
            <Text style={[styles.specItem, { color: theme.textPrimary }]}>
              <Text style={[styles.specKey, { color: theme.textFaint }]}>SHTR </Text>
              {item.shutter}
            </Text>
          </View>
        )}

        {/* Clip & Timestamp Row */}
        <View style={[styles.clipRow, { borderTopColor: theme.border }]}>
          <Text style={[styles.clipName, { color: theme.textSecondary }]}>
            CLIP: {item.clipName || 'No Clip ID'}
          </Text>
          <Text style={[styles.timeStr, { color: theme.textFaint }]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Remarks */}
        {item.notes ? (
          <View style={[styles.notesBox, { backgroundColor: theme.surfaceRaised }]}>
            <Text style={[styles.notesText, { color: theme.textSecondary }]}>{item.notes}</Text>
          </View>
        ) : null}

        {/* Explicit Action Buttons (EDIT & DELETE) */}
        <View style={[styles.cardActionRow, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.actionBtnEdit, { backgroundColor: theme.accentWash, borderColor: theme.accent }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditing({ ...item });
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Feather name="edit-2" size={12} color={theme.accent} />
              <Text style={[styles.actionBtnEditText, { color: theme.accent }]}>EDIT</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnDel, { borderColor: theme.danger }]}
            onPress={() => handleDelete(item.id, `Slate ${item.slate} (Sc ${item.scene} Tk ${item.take})`)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Feather name="trash-2" size={12} color={theme.danger} />
              <Text style={[styles.actionBtnDelText, { color: theme.danger }]}>HAPUS</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const totalSlates = takes.length > 0 ? new Set(takes.map((t) => t.slate)).size : 0;

  return (
    <View style={styles.container}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.textPrimary }]}>{totalSlates}</Text>
          <Text style={[styles.statLbl, { color: theme.textFaint }]}>TOTAL SLATE</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.good }]}>{takes.filter((t) => t.isGood).length}</Text>
          <Text style={[styles.statLbl, { color: theme.textFaint }]}>PRINT TAKES</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.accent }]}>{new Set(takes.map((t) => t.scene)).size}</Text>
          <Text style={[styles.statLbl, { color: theme.textFaint }]}>SCENES</Text>
        </View>
      </View>

      {/* Day Filter Chips - Elevated Cinema Design */}
      {days.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>
          <TouchableOpacity
            style={[
              styles.dayChip,
              { backgroundColor: theme.surfaceRaised, borderColor: filterDay === null ? theme.accent : theme.border },
              filterDay === null && { backgroundColor: theme.accentWash },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilterDay(null);
            }}
          >
            <Text style={[styles.dayChipText, { color: filterDay === null ? theme.accent : theme.textPrimary }]}>
              Semua Day
            </Text>
            <View style={[styles.dayChipCountBadge, { backgroundColor: filterDay === null ? theme.accent : theme.surface }]}>
              <Text style={[styles.dayChipCountText, { color: filterDay === null ? '#000' : theme.textFaint }]}>
                {takes.length}
              </Text>
            </View>
          </TouchableOpacity>
          {days.map((d) => {
            const isSelected = filterDay === d;
            const countForDay = takes.filter((t) => t.day === d).length;
            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dayChip,
                  { backgroundColor: theme.surfaceRaised, borderColor: isSelected ? theme.accent : theme.border },
                  isSelected && { backgroundColor: theme.accentWash },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilterDay(filterDay === d ? null : d);
                }}
              >
                <Text style={[styles.dayChipText, { color: isSelected ? theme.accent : theme.textPrimary }]}>
                  DAY {d}
                </Text>
                <View style={[styles.dayChipCountBadge, { backgroundColor: isSelected ? theme.accent : theme.surface }]}>
                  <Text style={[styles.dayChipCountText, { color: isSelected ? '#000' : theme.textFaint }]}>
                    {countForDay}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Cari scene / shot / clip / card / catatan..."
          placeholderTextColor={theme.textFaint}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: filterGood
                ? isDarkMode
                  ? 'rgba(74, 222, 128, 0.1)'
                  : 'rgba(34, 197, 94, 0.1)'
                : theme.surfaceRaised,
              borderColor: filterGood ? theme.good : theme.border,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterGood(!filterGood);
          }}
        >
          <Text style={[styles.filterBtnText, { color: filterGood ? theme.good : theme.textSecondary }]}>
            {filterGood ? 'PRINT ONLY' : 'SEMUA TAKE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grouped List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.bg }]}>
            <Text style={[styles.sectionTitle, { color: theme.accent }]}>{section.title}</Text>
            <Text style={[styles.sectionCount, { color: theme.textFaint }]}>{section.data.length} take</Text>
          </View>
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="film" size={36} color={theme.textFaint} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Belum ada Take</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Buka tab SLATE untuk mulai logging take kamera.
            </Text>
          </View>
        }
      />

      {/* FULL WORKING EDIT MODAL */}
      <Modal visible={!!editing} animationType="slide" transparent={false} onRequestClose={() => setEditing(null)}>
        {editing && (
          <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
            >
              {/* Modal Top Header Bar */}
              <View style={[styles.modalTopHeader, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
                <View>
                  <Text style={[styles.modalMainTitle, { color: theme.textPrimary }]}>EDIT DATA TAKE</Text>
                  <Text style={[styles.modalSubTitle, { color: theme.accent }]}>
                    SLATE {editing.slate} · SCENE {editing.scene} · TAKE {editing.take}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseIconBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                  onPress={() => setEditing(null)}
                >
                  <Text style={[styles.modalCloseIconText, { color: theme.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable Form Body */}
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* SLATE & DAY ROW */}
                <View style={styles.modalGrid}>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>SLATE NUMBER</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.accent, fontWeight: '800' }]}
                      value={String(editing.slate)}
                      keyboardType="numeric"
                      onChangeText={(t) => setEditing({ ...editing, slate: parseInt(t) || 1 })}
                    />
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>DAY / HARI KE</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={String(editing.day || 1)}
                      keyboardType="numeric"
                      onChangeText={(t) => setEditing({ ...editing, day: parseInt(t) || 1 })}
                    />
                  </View>
                </View>

                {/* SCENE, SHOT, TAKE ROW */}
                <View style={styles.modalGrid}>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>SCENE</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.scene}
                      autoCapitalize="characters"
                      onChangeText={(t) => setEditing({ ...editing, scene: t })}
                    />
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>SHOT</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.shot}
                      autoCapitalize="characters"
                      onChangeText={(t) => setEditing({ ...editing, shot: t })}
                    />
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>TAKE</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.accent, fontWeight: '800' }]}
                      value={String(editing.take)}
                      keyboardType="numeric"
                      onChangeText={(t) => setEditing({ ...editing, take: parseInt(t) || 1 })}
                    />
                  </View>
                </View>

                {/* LOC (INT/EXT) & LIGHT (DAY/NIGHT) */}
                <View style={styles.modalGrid}>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>LOCATION</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {(['INT', 'EXT'] as const).map((loc) => {
                        const isCur = (editing.intExt || 'INT') === loc;
                        return (
                          <TouchableOpacity
                            key={loc}
                            style={[
                              styles.presetChip,
                              { flex: 1, alignItems: 'center', backgroundColor: theme.surfaceRaised, borderColor: isCur ? theme.accent : theme.border },
                              isCur && { backgroundColor: theme.accentWash },
                            ]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setEditing({ ...editing, intExt: loc });
                            }}
                          >
                            <Text style={[styles.presetChipText, { color: isCur ? theme.accent : theme.textSecondary }]}>
                              {loc}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>LIGHTING</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {(['DAY', 'NIGHT'] as const).map((dn) => {
                        const isCur = (editing.dayNight || 'DAY') === dn;
                        return (
                          <TouchableOpacity
                            key={dn}
                            style={[
                              styles.presetChip,
                              { flex: 1, alignItems: 'center', backgroundColor: theme.surfaceRaised, borderColor: isCur ? theme.accent : theme.border },
                              isCur && { backgroundColor: theme.accentWash },
                            ]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setEditing({ ...editing, dayNight: dn });
                            }}
                          >
                            <Text style={[styles.presetChipText, { color: isCur ? theme.accent : theme.textSecondary }]}>
                              {dn}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* CAMERA SPECIFICATIONS: MULTICAM OR SINGLE CAM */}
                {editing.cameras && editing.cameras.length > 1 ? (
                  /* MULTI-CAMERA: DROPDOWNS PER CAMERA */
                  <View style={{ gap: 10, marginVertical: 6 }}>
                    <Text style={[styles.subLbl, { color: theme.accent, letterSpacing: 0.8 }]}>
                      SPESIFIKASI TIAP KAMERA ({editing.cameras.length} KAMERA):
                    </Text>
                    {editing.cameras.map((c, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.modalCamBox,
                          { backgroundColor: theme.surfaceRaised, borderColor: theme.border, padding: 12, borderRadius: 10, gap: 8 },
                        ]}
                      >
                        <Text style={[styles.modalCamTitle, { color: theme.accent, fontSize: 13, fontWeight: '800' }]}>
                          KAMERA {c.camera}
                        </Text>
                        
                        {/* ROLL & CLIP NAME */}
                        <View style={styles.modalGrid}>
                          {renderDropdownField(
                            'ROLL / CARD',
                            c.card,
                            cardOptions,
                            (val) => {
                              const updatedCams = [...editing.cameras!];
                              const newClip = `${val}_${String(editing.take).padStart(3, '0')}`;
                              updatedCams[idx] = { ...updatedCams[idx], card: val, clipName: newClip };
                              setEditing({ ...editing, cameras: updatedCams });
                            }
                          )}
                          <View style={styles.modalField}>
                            <Text style={[styles.subLbl, { color: theme.textFaint }]}>CLIP NAME</Text>
                            <TextInput
                              style={[styles.modalInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                              value={c.clipName}
                              onChangeText={(val) => {
                                const updatedCams = [...editing.cameras!];
                                updatedCams[idx] = { ...updatedCams[idx], clipName: val };
                                setEditing({ ...editing, cameras: updatedCams });
                              }}
                            />
                          </View>
                        </View>

                        {/* LENS & T-STOP */}
                        <View style={styles.modalGrid}>
                          {renderDropdownField(
                            'LENS',
                            c.lens || '',
                            lensOptions,
                            (val) => {
                              const updatedCams = [...editing.cameras!];
                              updatedCams[idx] = { ...updatedCams[idx], lens: val };
                              setEditing({ ...editing, cameras: updatedCams });
                            },
                            { suffix: 'mm' }
                          )}
                          {renderDropdownField(
                            'T-STOP',
                            c.tstop || '',
                            standardTstops,
                            (val) => {
                              const updatedCams = [...editing.cameras!];
                              updatedCams[idx] = { ...updatedCams[idx], tstop: val };
                              setEditing({ ...editing, cameras: updatedCams });
                            },
                            { prefix: 'T' }
                          )}
                        </View>

                        {/* SHUTTER, ISO, FPS */}
                        <View style={styles.modalGrid}>
                          {renderDropdownField(
                            'SHUTTER',
                            c.shutter || editing.shutter,
                            shutterOptions,
                            (val) => {
                              const updatedCams = [...editing.cameras!];
                              updatedCams[idx] = { ...updatedCams[idx], shutter: val };
                              setEditing({ ...editing, cameras: updatedCams });
                            }
                          )}
                          {renderDropdownField(
                            'ISO',
                            c.iso || editing.iso,
                            isoOptions,
                            (val) => {
                              const updatedCams = [...editing.cameras!];
                              updatedCams[idx] = { ...updatedCams[idx], iso: val };
                              setEditing({ ...editing, cameras: updatedCams });
                            }
                          )}
                          {renderDropdownField(
                            'FPS',
                            c.fps || editing.fps,
                            standardFps,
                            (val) => {
                              const updatedCams = [...editing.cameras!];
                              updatedCams[idx] = { ...updatedCams[idx], fps: val };
                              setEditing({ ...editing, cameras: updatedCams });
                            }
                          )}
                        </View>

                        {/* OPTICAL FILTER / ND */}
                        {renderDropdownField(
                          `OPTICAL FILTER / ND (${c.camera.split(' ')[0]})`,
                          c.filter || editing.filter,
                          filterOptions,
                          (val) => {
                            const updatedCams = [...editing.cameras!];
                            updatedCams[idx] = { ...updatedCams[idx], filter: val };
                            setEditing({ ...editing, cameras: updatedCams });
                          }
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  /* SINGLE-CAMERA: DROPDOWNS */
                  <>
                    {/* CAMERA & ROLL */}
                    <View style={styles.modalGrid}>
                      {renderDropdownField(
                        'CAMERA',
                        editing.camera,
                        cameraOptions,
                        (val) => setEditing({ ...editing, camera: val })
                      )}
                      {renderDropdownField(
                        'ROLL / CARD',
                        editing.card,
                        cardOptions,
                        (val) => {
                          const newClip = `${val}_${String(editing.take).padStart(3, '0')}`;
                          setEditing({ ...editing, card: val, clipName: newClip });
                        }
                      )}
                    </View>

                    {/* CLIP NAME */}
                    <View style={styles.modalFieldSingle}>
                      <Text style={[styles.subLbl, { color: theme.textFaint }]}>CLIP NAME</Text>
                      <TextInput
                        style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                        value={editing.clipName}
                        onChangeText={(t) => setEditing({ ...editing, clipName: t })}
                      />
                    </View>

                    {/* LENS & T-STOP & SHUTTER */}
                    <View style={styles.modalGrid}>
                      {renderDropdownField(
                        'LENS',
                        editing.lens,
                        lensOptions,
                        (val) => setEditing({ ...editing, lens: val }),
                        { suffix: 'mm' }
                      )}
                      {renderDropdownField(
                        'T-STOP',
                        editing.tstop,
                        standardTstops,
                        (val) => setEditing({ ...editing, tstop: val }),
                        { prefix: 'T' }
                      )}
                      {renderDropdownField(
                        'SHUTTER',
                        editing.shutter,
                        shutterOptions,
                        (val) => setEditing({ ...editing, shutter: val })
                      )}
                    </View>

                    {/* ISO & FPS */}
                    <View style={styles.modalGrid}>
                      {renderDropdownField(
                        'ISO',
                        editing.iso,
                        isoOptions,
                        (val) => setEditing({ ...editing, iso: val })
                      )}
                      {renderDropdownField(
                        'FPS',
                        editing.fps,
                        standardFps,
                        (val) => setEditing({ ...editing, fps: val })
                      )}
                    </View>

                    {/* OPTICAL FILTER / ND */}
                    {renderDropdownField(
                      'OPTICAL FILTER / ND',
                      editing.filter,
                      filterOptions,
                      (val) => setEditing({ ...editing, filter: val })
                    )}
                  </>
                )}

                {/* REMARKS / CATATAN */}
                <View style={styles.modalFieldSingle}>
                  <Text style={[styles.subLbl, { color: theme.textFaint }]}>CATATAN / REMARKS</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalNotes, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                    value={editing.notes}
                    multiline
                    placeholder="Catatan sutradara / 1st AC..."
                    placeholderTextColor={theme.textFaint}
                    onChangeText={(t) => setEditing({ ...editing, notes: t })}
                  />
                </View>

                {/* TAKE STATUS (PRINT / HOLD / NG) */}
                <View style={{ marginVertical: 6, gap: 4 }}>
                  <Text style={[styles.subLbl, { color: theme.textFaint }]}>STATUS TAKE (EDITOR & SUTRADARA)</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['PRINT', 'HOLD', 'NG'] as const).map((st) => {
                      const isCur = (editing.status || (editing.isGood ? 'PRINT' : 'HOLD')) === st;
                      const col = st === 'PRINT' ? theme.good : st === 'NG' ? theme.danger : theme.textSecondary;
                      return (
                        <TouchableOpacity
                          key={st}
                          style={[
                            styles.modalStatusBtn,
                            { backgroundColor: theme.surfaceRaised, borderColor: isCur ? col : theme.border },
                            isCur && {
                              backgroundColor: st === 'PRINT' ? 'rgba(74, 222, 128, 0.15)' : st === 'NG' ? 'rgba(255, 107, 107, 0.15)' : theme.accentWash,
                            },
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setEditing({
                              ...editing,
                              status: st,
                              isGood: st === 'PRINT',
                            });
                          }}
                        >
                          <Text style={[styles.modalStatusText, { color: isCur ? col : theme.textFaint }, isCur && { fontWeight: '800' }]}>
                            {st}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* BOTTOM ACTION BUTTONS */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalDelBtn, { borderColor: theme.danger }]}
                    onPress={() => handleDelete(editing.id, `Slate ${editing.slate} (Scene ${editing.scene} Take ${editing.take})`)}
                  >
                    <Text style={{ color: theme.danger, fontWeight: '800', fontSize: 12 }}>HAPUS TAKE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                    onPress={() => setEditing(null)}
                  >
                    <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13 }}>BATAL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalSaveBtn, { backgroundColor: theme.accent }]}
                    onPress={handleSaveEdit}
                  >
                    <Text style={{ color: '#000', fontWeight: '800', fontSize: 13.5 }}>SIMPAN</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Universal Dropdown Picker Modal */}
      <Modal visible={!!picker} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setPicker(null)}
        >
          <View
            style={[
              styles.pickerSheet,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.accent }]}>
                PILIH {picker?.title.toUpperCase()}
              </Text>
              <TouchableOpacity
                onPress={() => setPicker(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {picker?.options.map((opt) => {
                const isSelected = picker.currentValue === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.pickerOption,
                      { borderBottomColor: theme.borderLight },
                      isSelected && { backgroundColor: theme.accentWash },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      picker.onSelect(opt);
                      setPicker(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        { color: isSelected ? theme.accent : theme.textPrimary },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {opt}
                    </Text>
                    {isSelected && <Feather name="check" size={16} color={theme.accent} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBar: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '800', fontFamily: THEME.fontMono },
  statLbl: { fontSize: 9, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  dayChips: { flexDirection: 'row', gap: 8, paddingVertical: 8, marginBottom: 4 },
  dayChip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayChipText: { fontSize: 12.5, fontWeight: '800', letterSpacing: 0.5 },
  dayChipCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayChipCountText: {
    fontSize: 10.5,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    fontSize: 12.5,
  },
  filterBtn: {
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', fontFamily: THEME.fontMono, letterSpacing: 1 },
  sectionCount: { fontSize: 10.5, fontWeight: '600' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  slateBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  slateBadgeText: { fontSize: 11, fontWeight: '700', fontFamily: THEME.fontMono },
  starBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  starIcon: { fontSize: 13, fontWeight: '700' },
  multiCamContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    gap: 4,
  },
  multiCamTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  multiCamItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  multiCamTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  multiCamRollClip: {
    fontSize: 11,
  },
  cardSpecs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  specItem: { fontSize: 11 },
  specKey: { fontWeight: '700' },
  clipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
  },
  clipName: { fontSize: 11.5, fontFamily: THEME.fontMono },
  timeStr: { fontSize: 10 },
  notesBox: { marginTop: 6, borderRadius: 6, padding: 6 },
  notesText: { fontSize: 11.5, fontStyle: 'italic' },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actionBtnEdit: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnEditText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionBtnDel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDelText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyWrap: { paddingVertical: 50, alignItems: 'center', gap: 6 },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyDesc: { fontSize: 12, textAlign: 'center' },

  // Edit Modal Styles
  modalSafeArea: {
    flex: 1,
  },
  modalTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalSubTitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: THEME.fontMono,
    marginTop: 2,
  },
  modalCloseIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseIconText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  modalGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  modalField: {
    flex: 1,
  },
  modalFieldSingle: {
    width: '100%',
  },
  subLbl: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalCamBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 6,
  },
  modalCamTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
    letterSpacing: 0.8,
  },
  modalStatusBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStatusText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  modalNotes: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  modalGoodBtn: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  modalGoodBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  modalDelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownTrigger: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 18,
    paddingBottom: 36,
    gap: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pickerTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerOptionText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
