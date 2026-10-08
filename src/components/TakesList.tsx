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
import { useHonglogStore } from '../store/useHonglogStore';
import { TakeEntry, THEME, LIGHT_THEME, ThemeColors } from '../types';

export const TakesList: React.FC = () => {
  const { takes, deleteTake, updateTake, meta, isDarkMode } = useHonglogStore();
  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;

  const [filterGood, setFilterGood] = useState(false);
  const [filterDay, setFilterDay] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<TakeEntry | null>(null);

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

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await updateTake(editing.id, editing);
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
              SLATE {item.slate} · SCENE {item.scene} · SHOT {item.shot} · TAKE {item.take}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleToggleStar(item)}
            style={styles.starBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.starIcon, { color: item.isGood ? theme.good : theme.textFaint }]}>
              {item.isGood ? '★ GOOD' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Multi-Cam Indicator if applicable */}
        {isMultiCam && item.cameras && (
          <View style={[styles.multiCamContainer, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
            <Text style={[styles.multiCamTitle, { color: theme.accent }]}>
              🎥 MULTI-KAMERA ({item.cameras.length} CAM):
            </Text>
            {item.cameras.map((c, idx) => (
              <View key={idx} style={styles.multiCamItemRow}>
                <Text style={[styles.multiCamTag, { color: theme.textPrimary }]}>
                  {c.camera}:
                </Text>
                <Text style={[styles.multiCamRollClip, { color: theme.textSecondary }]}>
                  Roll <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{c.card}</Text> · Clip <Text style={{ color: theme.accent, fontWeight: '700' }}>{c.clipName}</Text>
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
            📁 {item.clipName || 'No Clip ID'}
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
            <Text style={[styles.actionBtnEditText, { color: theme.accent }]}>✏️ EDIT TAKE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnDel, { borderColor: theme.danger }]}
            onPress={() => handleDelete(item.id, `Slate ${item.slate} (Sc ${item.scene} Tk ${item.take})`)}
          >
            <Text style={[styles.actionBtnDelText, { color: theme.danger }]}>🗑️ HAPUS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.textPrimary }]}>{takes.length}</Text>
          <Text style={[styles.statLbl, { color: theme.textFaint }]}>TOTAL TAKES</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.good }]}>{takes.filter((t) => t.isGood).length}</Text>
          <Text style={[styles.statLbl, { color: theme.textFaint }]}>GOOD TAKES</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.accent }]}>{new Set(takes.map((t) => t.scene)).size}</Text>
          <Text style={[styles.statLbl, { color: theme.textFaint }]}>SCENES</Text>
        </View>
      </View>

      {/* Day Filter Chips */}
      {days.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>
          <TouchableOpacity
            style={[
              styles.dayChip,
              { backgroundColor: theme.surfaceRaised, borderColor: filterDay === null ? theme.accent : theme.border },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilterDay(null);
            }}
          >
            <Text style={[styles.dayChipText, { color: filterDay === null ? theme.accent : theme.textSecondary }]}>
              Semua Day
            </Text>
          </TouchableOpacity>
          {days.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.dayChip,
                { backgroundColor: theme.surfaceRaised, borderColor: filterDay === d ? theme.accent : theme.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterDay(filterDay === d ? null : d);
              }}
            >
              <Text style={[styles.dayChipText, { color: filterDay === d ? theme.accent : theme.textSecondary }]}>
                DAY {d}
              </Text>
            </TouchableOpacity>
          ))}
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
            {filterGood ? '★ Good' : 'Semua'}
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
            <Text style={styles.emptyEmoji}>🎬</Text>
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

                {/* CAMERA & ROLL */}
                <View style={styles.modalGrid}>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>CAMERA</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.camera}
                      onChangeText={(t) => setEditing({ ...editing, camera: t })}
                    />
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>ROLL / CARD</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.card}
                      onChangeText={(t) => setEditing({ ...editing, card: t })}
                    />
                  </View>
                </View>

                {/* Quick Card Presets */}
                <View style={{ marginBottom: 6 }}>
                  <Text style={[styles.subLbl, { color: theme.textFaint }]}>PILIH ROLL PRESET:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
                    {meta.cards.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.presetChip,
                          { backgroundColor: theme.surfaceRaised, borderColor: editing.card === c ? theme.accent : theme.border },
                          editing.card === c && { backgroundColor: theme.accentWash },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setEditing({ ...editing, card: c });
                        }}
                      >
                        <Text style={[styles.presetChipText, { color: editing.card === c ? theme.accent : theme.textSecondary }]}>
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
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
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>LENS (MM)</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.lens}
                      onChangeText={(t) => setEditing({ ...editing, lens: t })}
                    />
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>T-STOP</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.tstop}
                      onChangeText={(t) => setEditing({ ...editing, tstop: t })}
                    />
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>SHUTTER</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.shutter}
                      onChangeText={(t) => setEditing({ ...editing, shutter: t })}
                    />
                  </View>
                </View>

                {/* ISO & FILTER & FPS */}
                <View style={styles.modalGrid}>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>ISO</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.iso}
                      onChangeText={(t) => setEditing({ ...editing, iso: t })}
                    />
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>FILTER</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.filter}
                      onChangeText={(t) => setEditing({ ...editing, filter: t })}
                    />
                  </View>
                  <View style={styles.modalField}>
                    <Text style={[styles.subLbl, { color: theme.textFaint }]}>FPS</Text>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                      value={editing.fps}
                      onChangeText={(t) => setEditing({ ...editing, fps: t })}
                    />
                  </View>
                </View>

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

                {/* GOOD TAKE TOGGLE */}
                <TouchableOpacity
                  style={[
                    styles.modalGoodBtn,
                    { borderColor: editing.isGood ? theme.good : theme.border, backgroundColor: theme.surfaceRaised },
                    editing.isGood && { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: theme.good },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setEditing({ ...editing, isGood: !editing.isGood });
                  }}
                >
                  <Text style={[styles.modalGoodBtnText, { color: editing.isGood ? theme.good : theme.textSecondary }]}>
                    {editing.isGood ? '★ GOOD TAKE (TERPILIH)' : '☆ TANDAI SEBAGAI GOOD TAKE'}
                  </Text>
                </TouchableOpacity>

                {/* BOTTOM ACTION BUTTONS */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalDelBtn, { borderColor: theme.danger }]}
                    onPress={() => handleDelete(editing.id, `Slate ${editing.slate} (Scene ${editing.scene} Take ${editing.take})`)}
                  >
                    <Text style={{ color: theme.danger, fontWeight: '700', fontSize: 13 }}>🗑️ HAPUS</Text>
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
                    <Text style={{ color: '#000', fontWeight: '800', fontSize: 13.5 }}>💾 SIMPAN</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
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
  dayChips: { flexDirection: 'row', gap: 6, paddingBottom: 10 },
  dayChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayChipText: { fontSize: 11.5, fontWeight: '700' },
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
});
