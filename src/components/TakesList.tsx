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
  Pressable,
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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [slateInput, setSlateInput] = useState('');
  const [dayInput, setDayInput] = useState('');
  const [takeInput, setTakeInput] = useState('');

  const [picker, setPicker] = useState<{
    title: string;
    options: string[];
    currentValue: string;
    onSelect: (val: string) => void;
    multi?: boolean;
    suffix?: string;
    prefix?: string;
  } | null>(null);

  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [customPickerInput, setCustomPickerInput] = useState('');

  const formatLenses = (lensStr?: string) => {
    if (!lensStr || lensStr === '-') return '-';
    return lensStr
      .split(/,\s*|\/\s*|\+\s*/)
      .map((l) => {
        const clean = l.trim();
        if (!clean) return '';
        return clean.toLowerCase().endsWith('mm') ? clean : `${clean}mm`;
      })
      .filter(Boolean)
      .join(', ');
  };

  const standardTstops = ['1.4', '1.8', '2.0', '2.8', '4.0', '5.6', '8.0', '11', '16', '22'];
  const standardFps = ['23.976', '24', '25', '29.97', '48', '50', '59.94', '60', '100', '120'];
  const defaultCommonLenses = [
    '12', '13', '14', '16', '18', '21', '24', '28', '32', '35',
    '40', '50', '65', '75', '85', '100', '105', '135', '150', '180', '200',
  ];
  const lensOptions = Array.from(
    new Set([
      ...meta.lenses.map((l) => l.replace(/mm/gi, '').trim()),
      ...defaultCommonLenses,
    ])
  ).filter(Boolean);
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
          setIsEditOpen(false);
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
    config?: { suffix?: string; prefix?: string; placeholder?: string; flex?: number; multi?: boolean }
  ) => {
    const prefix = config?.prefix || '';
    const suffix = config?.suffix || '';
    let displayVal: string;
    if (config?.multi && value) {
      displayVal = value
        .split(/,\s*|\/\s*|\+\s*/)
        .map((v) => {
          const clean = v.trim();
          if (!clean) return '';
          if (suffix && clean.toLowerCase().endsWith(suffix.toLowerCase())) {
            return `${prefix}${clean}`;
          }
          return `${prefix}${clean}${suffix}`;
        })
        .filter(Boolean)
        .join(', ');
    } else {
      if (value) {
        if (suffix && value.toLowerCase().endsWith(suffix.toLowerCase())) {
          displayVal = `${prefix}${value}`;
        } else {
          displayVal = `${prefix}${value}${suffix}`;
        }
      } else {
        displayVal = config?.placeholder || 'Pilih...';
      }
    }

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
            if (config?.multi) {
              const currentArray = (value || '')
                .split(/,\s*|\/\s*|\+\s*/)
                .map((s) => s.replace(/mm/gi, '').trim())
                .filter(Boolean);
              setMultiSelected(currentArray);
            }
            const currentValues = (value || '')
              .split(/,\s*|\/\s*|\+\s*/)
              .map((s) => (config?.suffix ? s.replace(new RegExp(config.suffix, 'gi'), '') : s).trim())
              .filter(Boolean);
            const mergedOptions = Array.from(new Set([
              ...currentValues,
              ...options,
            ])).filter(Boolean);

            setCustomPickerInput('');
            setPicker({
              title: label,
              options: mergedOptions,
              currentValue: value,
              onSelect,
              multi: config?.multi,
              suffix: config?.suffix,
              prefix: config?.prefix,
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
      const finalSlate = parseInt(slateInput, 10) || editing.slate || 1;
      const finalDay = parseInt(dayInput, 10) || editing.day || 1;
      const finalTake = parseInt(takeInput, 10) || editing.take || 1;
      let payload = {
        ...editing,
        slate: finalSlate,
        day: finalDay,
        take: finalTake,
      };
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
      } else if (payload.cameras && payload.cameras.length === 1) {
        payload.cameras = [{
          ...payload.cameras[0],
          camera: payload.camera,
          card: payload.card,
          clipName: payload.clipName,
          lens: payload.lens,
          tstop: payload.tstop,
          shutter: payload.shutter,
          iso: payload.iso,
          filter: payload.filter,
          fps: payload.fps,
        }];
      }
      await updateTake(editing.id, payload);
      setIsEditOpen(false);
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
                  Roll <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{c.card}</Text> · Lens <Text style={{ color: theme.accent, fontWeight: '700' }}>{formatLenses(c.lens)}</Text> · FPS <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{c.fps || item.fps || '24'}</Text> · Clip <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{c.clipName}</Text>
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
              {formatLenses(item.lens)}
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
              setSlateInput(String(item.slate));
              setDayInput(String(item.day || 1));
              setTakeInput(String(item.take));
              setIsEditOpen(true);
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

      {/* Day Filter Chips with comfortable spacing and margin */}
      {days.length > 0 && (
        <View style={styles.dayFilterSection}>
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
        </View>
      )}

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Feather name="search" size={14} color={theme.textFaint} style={{ marginRight: 6 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Cari scene, shot, clip, roll, catatan..."
            placeholderTextColor={theme.textFaint}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={14} color={theme.textFaint} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: filterGood
                ? isDarkMode
                  ? 'rgba(74, 222, 128, 0.12)'
                  : 'rgba(34, 197, 94, 0.12)'
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
      <Modal
        visible={isEditOpen}
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        onRequestClose={() => setIsEditOpen(false)}
        onDismiss={() => {
          setEditing(null);
        }}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: theme.bg }]}>
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
                    onPress={() => setIsEditOpen(false)}
                  >
                    <Feather name="x" size={16} color={theme.textSecondary} />
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
                        value={slateInput}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor={theme.textFaint}
                        onChangeText={(t) => {
                          const clean = t.replace(/[^0-9]/g, '');
                          setSlateInput(clean);
                          if (clean !== '') {
                            setEditing({ ...editing, slate: parseInt(clean, 10) });
                          }
                        }}
                        onBlur={() => {
                          if (!slateInput || parseInt(slateInput, 10) < 1) {
                            setSlateInput('1');
                            setEditing({ ...editing, slate: 1 });
                          }
                        }}
                      />
                    </View>
                    <View style={styles.modalField}>
                      <Text style={[styles.subLbl, { color: theme.textFaint }]}>DAY / HARI KE</Text>
                      <TextInput
                        style={[styles.modalInput, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
                        value={dayInput}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor={theme.textFaint}
                        onChangeText={(t) => {
                          const clean = t.replace(/[^0-9]/g, '');
                          setDayInput(clean);
                          if (clean !== '') {
                            setEditing({ ...editing, day: parseInt(clean, 10) });
                          }
                        }}
                        onBlur={() => {
                          if (!dayInput || parseInt(dayInput, 10) < 1) {
                            setDayInput('1');
                            setEditing({ ...editing, day: 1 });
                          }
                        }}
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
                        value={takeInput}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor={theme.textFaint}
                        onChangeText={(t) => {
                          const clean = t.replace(/[^0-9]/g, '');
                          setTakeInput(clean);
                          if (clean !== '') {
                            setEditing({ ...editing, take: parseInt(clean, 10) });
                          }
                        }}
                        onBlur={() => {
                          if (!takeInput || parseInt(takeInput, 10) < 1) {
                            setTakeInput('1');
                            setEditing({ ...editing, take: 1 });
                          }
                        }}
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
                            { suffix: 'mm', multi: true }
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
                        (val) => {
                          const updatedCams = editing.cameras && editing.cameras.length > 0 ? [...editing.cameras] : [];
                          if (updatedCams.length > 0) {
                            updatedCams[0] = { ...updatedCams[0], lens: val };
                          }
                          setEditing({ ...editing, lens: val, cameras: updatedCams });
                        },
                        { suffix: 'mm', multi: true }
                      )}
                      {renderDropdownField(
                        'T-STOP',
                        editing.tstop,
                        standardTstops,
                        (val) => {
                          const updatedCams = editing.cameras && editing.cameras.length > 0 ? [...editing.cameras] : [];
                          if (updatedCams.length > 0) {
                            updatedCams[0] = { ...updatedCams[0], tstop: val };
                          }
                          setEditing({ ...editing, tstop: val, cameras: updatedCams });
                        },
                        { prefix: 'T' }
                      )}
                      {renderDropdownField(
                        'SHUTTER',
                        editing.shutter,
                        shutterOptions,
                        (val) => {
                          const updatedCams = editing.cameras && editing.cameras.length > 0 ? [...editing.cameras] : [];
                          if (updatedCams.length > 0) {
                            updatedCams[0] = { ...updatedCams[0], shutter: val };
                          }
                          setEditing({ ...editing, shutter: val, cameras: updatedCams });
                        }
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
                    onPress={() => setIsEditOpen(false)}
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

            {/* Universal Dropdown Picker Overlay (Inside Edit Modal to bypass iOS nested Modal limitations) */}
            {!!picker && (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.pickerOverlay}
              >
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setPicker(null)} />
                <View
                  style={[
                    styles.pickerSheet,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.pickerHeader}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[styles.pickerTitle, { color: theme.accent }]}>
                        PILIH {picker.title.toUpperCase()} {picker.multi ? '(BISA MULTIPLE)' : ''}
                      </Text>
                      <Text style={[styles.pickerSubtitle, { color: theme.textSecondary }]}>
                        {picker.multi ? 'Pilih satu/banyak lensa atau ketik manual' : 'Pilih opsi atau ketik manual'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setPicker(null)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.pickerCloseBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                    >
                      <Feather name="x" size={16} color={theme.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  {/* If multi-select (e.g. LENS), show selected chips with (x) delete button */}
                  {picker.multi && (
                    <View style={styles.pickerSelectedSection}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.pickerSectionLabel, { color: theme.textFaint }]}>
                          LENSA TERPILIH ({multiSelected.length}):
                        </Text>
                        {multiSelected.length > 0 && (
                          <TouchableOpacity
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setMultiSelected([]);
                            }}
                          >
                            <Text style={{ fontSize: 11, color: theme.danger, fontWeight: '700' }}>
                              Hapus Semua
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.pickerSelectedWrap}>
                        {multiSelected.map((item) => (
                          <View
                            key={item}
                            style={[
                              styles.pickerActiveChip,
                              { backgroundColor: theme.accentWash, borderColor: theme.accent },
                            ]}
                          >
                            <Text style={[styles.pickerActiveChipText, { color: theme.accent }]}>
                              {item}{picker.suffix || ''}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setMultiSelected(multiSelected.filter((x) => x !== item));
                              }}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                              <Feather name="x" size={12} color={theme.danger} />
                            </TouchableOpacity>
                          </View>
                        ))}
                        {multiSelected.length === 0 && (
                          <Text style={{ fontSize: 11.5, color: theme.textFaint, fontStyle: 'italic', paddingVertical: 2 }}>
                            Belum ada opsi terpilih. Ketuk preset di bawah atau ketik manual.
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Preset Options Grid */}
                  <View style={{ maxHeight: 220 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                      <View style={styles.pickerChipsGrid}>
                        {picker.options.map((opt) => {
                          const isSelected = picker.multi
                            ? multiSelected.includes(opt)
                            : picker.currentValue === opt;
                          return (
                            <TouchableOpacity
                              key={opt}
                              style={[
                                styles.pickerChipBtn,
                                {
                                  backgroundColor: isSelected ? theme.accentWash : theme.surfaceRaised,
                                  borderColor: isSelected ? theme.accent : theme.border,
                                },
                              ]}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                if (picker.multi) {
                                  if (multiSelected.includes(opt)) {
                                    setMultiSelected(multiSelected.filter((o) => o !== opt));
                                  } else {
                                    setMultiSelected([...multiSelected, opt]);
                                  }
                                } else {
                                  picker.onSelect(opt);
                                  setPicker(null);
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.pickerChipText,
                                  { color: isSelected ? theme.accent : theme.textPrimary },
                                  isSelected && { fontWeight: '800' },
                                ]}
                              >
                                {picker.prefix || ''}{opt}{picker.suffix || ''}
                              </Text>
                              {isSelected && <Feather name="check" size={13} color={theme.accent} style={{ marginLeft: 3 }} />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Custom Input Row (Allows typing any custom focal length or value) */}
                  <View style={[styles.pickerCustomRow, { borderTopColor: theme.border }]}>
                    <TextInput
                      style={[
                        styles.pickerCustomInput,
                        {
                          backgroundColor: theme.surfaceRaised,
                          borderColor: theme.border,
                          color: theme.textPrimary,
                        },
                      ]}
                      placeholder={`Input manual ${picker.title.toLowerCase()} (cth: 13, 24-70)...`}
                      placeholderTextColor={theme.textFaint}
                      value={customPickerInput}
                      onChangeText={setCustomPickerInput}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={[styles.pickerCustomBtn, { backgroundColor: theme.accent }]}
                      onPress={() => {
                        const clean = (picker.suffix ? customPickerInput.replace(new RegExp(picker.suffix, 'gi'), '') : customPickerInput).trim();
                        if (!clean) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if (picker.multi) {
                          if (!multiSelected.includes(clean)) {
                            setMultiSelected([...multiSelected, clean]);
                          }
                          if (!picker.options.includes(clean)) {
                            setPicker({ ...picker, options: [clean, ...picker.options] });
                          }
                          setCustomPickerInput('');
                        } else {
                          picker.onSelect(clean);
                          setPicker(null);
                        }
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={{ color: '#000', fontWeight: '800', fontSize: 12 }}>
                        {picker.multi ? '+ Tambah' : 'Gunakan'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Multi-Select Save / Close Button */}
                  {picker.multi && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <TouchableOpacity
                        style={[styles.modalCancelBtn, { flex: 1, borderColor: theme.border, height: 44 }]}
                        onPress={() => setPicker(null)}
                      >
                        <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13 }}>BATAL</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalSaveBtn, { flex: 2, backgroundColor: theme.accent, height: 44 }]}
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          picker.onSelect(multiSelected.join(', '));
                          setPicker(null);
                        }}
                      >
                        <Text style={{ color: '#000', fontWeight: '800', fontSize: 13.5 }}>
                          SIMPAN ({multiSelected.length} PILIHAN)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </KeyboardAvoidingView>
            )}
          </SafeAreaView>
        )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBar: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: {
    flex: 1,
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: { fontSize: 22, fontWeight: '800', fontFamily: THEME.fontMono, lineHeight: 26 },
  statLbl: { fontSize: 8.5, fontWeight: '800', marginTop: 4, letterSpacing: 0.8, textAlign: 'center' },
  dayFilterSection: {
    marginVertical: 10,
  },
  dayChips: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  dayChip: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayChipText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  dayChipCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dayChipCountText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: THEME.fontMono,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'center' },
  searchBox: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 12.5,
    fontWeight: '600',
    paddingVertical: 0,
  },
  filterBtn: {
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
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
    minHeight: 40,
    paddingVertical: 8,
    borderRadius: 10,
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
    minHeight: 40,
    paddingVertical: 8,
    borderRadius: 10,
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
  modalBackdrop: {
    flex: 1,
  },
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.76)',
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 999,
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    paddingBottom: 28,
    gap: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pickerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pickerSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  pickerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerSelectedSection: {
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  pickerSectionLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pickerSelectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  pickerActiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerActiveChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pickerChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingVertical: 4,
  },
  pickerChipBtn: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerChipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  pickerCustomRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  pickerCustomInput: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12.5,
  },
  pickerCustomBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
