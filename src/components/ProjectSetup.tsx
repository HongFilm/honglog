import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useHonglogStore } from '../store/useHonglogStore';
import { THEME, LIGHT_THEME, ThemeColors, Project } from '../types';

export const ProjectSetup: React.FC = () => {
  const { meta, updateMeta, clearAllTakes, takes, projects, activeProjectId, createProject, selectProject, deleteProject, renameProject, isDarkMode } = useHonglogStore();
  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;

  const [production, setProduction] = useState(meta.production);
  const [prodNumber, setProdNumber] = useState(meta.prodNumber);
  const [director, setDirector] = useState(meta.director);
  const [dop, setDop] = useState(meta.dop);
  const [firstAc, setFirstAc] = useState(meta.firstAc);
  const [secondAc, setSecondAc] = useState(meta.secondAc);
  const [fileFormat, setFileFormat] = useState(meta.fileFormat);
  const [aspectRatio, setAspectRatio] = useState(meta.aspectRatio);
  const [lut, setLut] = useState(meta.lut);
  const [projectFps, setProjectFps] = useState(meta.projectFps);

  const [cameras, setCameras] = useState<string[]>(meta.cameras || []);
  const [cards, setCards] = useState<string[]>(meta.cards || []);
  const [lenses, setLenses] = useState<string[]>(meta.lenses || []);
  const [shutters, setShutters] = useState<string[]>(meta.shutters || []);
  const [filters, setFilters] = useState<string[]>(meta.filters || []);
  const [isos, setIsos] = useState<string[]>(meta.isos || []);

  const [addModal, setAddModal] = useState<{
    category: 'cameras' | 'cards' | 'lenses' | 'shutters' | 'filters' | 'isos';
    title: string;
    placeholder: string;
  } | null>(null);
  const [addText, setAddText] = useState('');

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [renamingProj, setRenamingProj] = useState<{ id: string; name: string } | null>(null);
  const [renameText, setRenameText] = useState('');

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Local draft fields mirror the active project whenever the selected project changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setProduction(meta.production);
    setProdNumber(meta.prodNumber);
    setDirector(meta.director);
    setDop(meta.dop);
    setFirstAc(meta.firstAc);
    setSecondAc(meta.secondAc);
    setFileFormat(meta.fileFormat);
    setAspectRatio(meta.aspectRatio);
    setLut(meta.lut);
    setProjectFps(meta.projectFps);
    setCameras(meta.cameras || []);
    setCards(meta.cards || []);
    setLenses(meta.lenses || []);
    setShutters(meta.shutters || []);
    setFilters(meta.filters || []);
    setIsos(meta.isos || []);
  }, [activeProjectId, meta]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleConfirmAddPreset = () => {
    if (!addModal || !addText.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const val = addText.trim();
    if (addModal.category === 'cameras') {
      setCameras([...cameras, val]);
    } else if (addModal.category === 'cards') {
      setCards([...cards, val]);
    } else if (addModal.category === 'lenses') {
      setLenses([...lenses, val.replace(/mm/gi, '').trim()]);
    } else if (addModal.category === 'shutters') {
      setShutters([...shutters, val]);
    } else if (addModal.category === 'filters') {
      setFilters([...filters, val]);
    } else if (addModal.category === 'isos') {
      setIsos([...isos, val]);
    }
    setAddModal(null);
  };

  const handleConfirmRename = async () => {
    if (!renamingProj || !renameText.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newName = renameText.trim();
    await renameProject(renamingProj.id, newName);
    if (renamingProj.id === activeProjectId) {
      setProduction(newName);
    }
    setRenamingProj(null);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Nama project tidak boleh kosong');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await createProject(newProjectName.trim());
    setNewProjectName('');
    setShowProjectModal(false);
  };

  const handleSelectProject = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await selectProject(id);
    setShowProjectModal(false);
    // Refresh local state with new project data
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setProduction(proj.meta.production);
      setProdNumber(proj.meta.prodNumber);
      setDirector(proj.meta.director);
      setDop(proj.meta.dop);
      setFirstAc(proj.meta.firstAc);
      setSecondAc(proj.meta.secondAc);
      setFileFormat(proj.meta.fileFormat);
      setAspectRatio(proj.meta.aspectRatio);
      setLut(proj.meta.lut);
      setProjectFps(proj.meta.projectFps);
      setCameras(proj.meta.cameras || []);
      setCards(proj.meta.cards || []);
      setLenses(proj.meta.lenses || []);
      setShutters(proj.meta.shutters || []);
      setFilters(proj.meta.filters || []);
      setIsos(proj.meta.isos || []);
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Hapus Project', `Yakin hapus project "${name}"? Semua take di dalamnya akan hilang.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteProject(id) },
    ]);
  };

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateMeta({
      production: production.trim() || 'Hong Films Production',
      prodNumber,
      director,
      dop,
      firstAc,
      secondAc,
      fileFormat,
      aspectRatio,
      lut,
      projectFps,
      cameras,
      cards,
      lenses,
      shutters,
      filters,
      isos,
    });
    Alert.alert('Tersimpan', 'Pengaturan produksi film berhasil diperbarui.');
  };

  const handleClearTakes = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Hapus Seluruh Take',
      `Ada ${takes.length} take tercatat. Yakin ingin menghapus seluruh log take? Data yang dihapus tidak bisa dikembalikan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: async () => {
            await clearAllTakes();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const renderPresetGroup = (
    title: string,
    category: 'cameras' | 'cards' | 'lenses' | 'shutters' | 'filters' | 'isos',
    items: string[],
    onRemove: (idx: number) => void,
    config: { placeholder: string; suffix?: string }
  ) => {
    return (
      <View style={styles.presetGroup}>
        <View style={styles.presetHeaderRow}>
          <Text style={[styles.presetGroupLabel, { color: theme.textSecondary }]}>{title}</Text>
          <TouchableOpacity
            style={[styles.addPresetBtn, { borderColor: theme.accent, backgroundColor: theme.accentWash }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAddText('');
              setAddModal({
                category,
                title,
                placeholder: config.placeholder,
              });
            }}
          >
            <Feather name="plus" size={12} color={theme.accent} />
            <Text style={[styles.addPresetBtnText, { color: theme.accent }]}>Tambah</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.presetChipsWrap}>
          {items.map((it, idx) => (
            <View
              key={`${it}_${idx}`}
              style={[styles.presetChipBadge, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
            >
              <Text style={[styles.presetChipBadgeText, { color: theme.textPrimary }]}>
                {it}{config.suffix || ''}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onRemove(idx);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.chipRemoveIconBtn}
              >
                <Feather name="x" size={12} color={theme.danger} />
              </TouchableOpacity>
            </View>
          ))}
          {items.length === 0 && (
            <Text style={[styles.emptyChipHint, { color: theme.textFaint }]}>
              Belum ada preset. Ketuk + Tambah untuk mengisi.
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Project Management Section - Compact Dropdown */}
      <Text style={[styles.sectionHeader, { color: theme.accent }]}>PROJECT FILM AKTIF</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, padding: 10 }]}>
        <TouchableOpacity
          style={[
            styles.projectDropdownTrigger,
            { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowProjectModal(true);
          }}
          activeOpacity={0.75}
        >
          <View style={styles.projectDropdownLeft}>
            <View style={[styles.projectIconBadge, { backgroundColor: theme.accentWash }]}>
              <Feather name="film" size={17} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.projectDropdownTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {activeProject?.name || 'Pilih Project'}
              </Text>
              <Text style={[styles.projectDropdownSubtitle, { color: theme.textSecondary }]}>
                {activeProject?.takes.length || 0} takes &bull; Ketuk untuk beralih / buat project
              </Text>
            </View>
          </View>
          <View style={[styles.projectDropdownChevronWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="chevron-down" size={16} color={theme.textPrimary} />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionHeader, { color: theme.accent }]}>INFORMASI PRODUKSI & KRU</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textFaint }]}>JUDUL FILM / PRODUKSI</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
            value={production}
            onChangeText={setProduction}
            placeholder="Cth: Sang Penebus"
            placeholderTextColor={theme.textFaint}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textFaint }]}>PROD. NUMBER</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={prodNumber}
              onChangeText={setProdNumber}
              placeholder="01"
              placeholderTextColor={theme.textFaint}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textFaint }]}>BASE FPS</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={projectFps}
              onChangeText={setProjectFps}
              placeholder="24"
              placeholderTextColor={theme.textFaint}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textFaint }]}>DIRECTOR (SUTRADARA)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={director}
              onChangeText={setDirector}
              placeholder="Nama Sutradara"
              placeholderTextColor={theme.textFaint}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textFaint }]}>D.O.P</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={dop}
              onChangeText={setDop}
              placeholder="Nama DOP"
              placeholderTextColor={theme.textFaint}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textFaint }]}>1ST AC (FOCUS PULLER)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={firstAc}
              onChangeText={setFirstAc}
              placeholder="1st AC"
              placeholderTextColor={theme.textFaint}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textFaint }]}>2ND AC (CLAPPER/LOADER)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={secondAc}
              onChangeText={setSecondAc}
              placeholder="2nd AC"
              placeholderTextColor={theme.textFaint}
            />
          </View>
        </View>
      </View>

      <Text style={[styles.sectionHeader, { color: theme.accent }]}>SPESIFIKASI FORMAT KAMERA</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textFaint }]}>CODEC / FILE FORMAT</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
            value={fileFormat}
            onChangeText={setFileFormat}
            placeholder="ProRes 422 HQ / X-OCN"
            placeholderTextColor={theme.textFaint}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textFaint }]}>ASPECT RATIO</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={aspectRatio}
              onChangeText={setAspectRatio}
              placeholder="1.85:1 / 2.39:1"
              placeholderTextColor={theme.textFaint}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textFaint }]}>LUT</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={lut}
              onChangeText={setLut}
              placeholder="Rec.709 / Film Look"
              placeholderTextColor={theme.textFaint}
            />
          </View>
        </View>
      </View>

      <Text style={[styles.sectionHeader, { color: theme.accent }]}>PRESET DI SET (INTERAKTIF CHIP)</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, gap: 16 }]}>
        {renderPresetGroup('KAMERA DI SET', 'cameras', cameras, (idx) => setCameras(cameras.filter((_, i) => i !== idx)), { placeholder: 'Cth: A (FX6)' })}
        {renderPresetGroup('CARD / ROLL', 'cards', cards, (idx) => setCards(cards.filter((_, i) => i !== idx)), { placeholder: 'Cth: A001, B001' })}
        {renderPresetGroup('PRESET LENSA (MM)', 'lenses', lenses, (idx) => setLenses(lenses.filter((_, i) => i !== idx)), { placeholder: 'Cth: 18, 24, 35', suffix: 'mm' })}
        {renderPresetGroup('PRESET SHUTTER', 'shutters', shutters, (idx) => setShutters(shutters.filter((_, i) => i !== idx)), { placeholder: 'Cth: 180°, 1/50' })}
        {renderPresetGroup('PRESET ISO', 'isos', isos, (idx) => setIsos(isos.filter((_, i) => i !== idx)), { placeholder: 'Cth: 800, 1600, 3200' })}
        {renderPresetGroup('PRESET FILTER / ND', 'filters', filters, (idx) => setFilters(filters.filter((_, i) => i !== idx)), { placeholder: 'Cth: Clear, ND.3, ND.6' })}
      </View>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>SIMPAN PENGATURAN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.dangerBtn, { borderColor: theme.danger }]} onPress={handleClearTakes} activeOpacity={0.85}>
        <Text style={[styles.dangerBtnText, { color: theme.danger }]}>Hapus Seluruh Take ({takes.length})</Text>
      </TouchableOpacity>

      {/* Rename Project Modal */}
      <Modal visible={!!renamingProj} animationType="fade" transparent onRequestClose={() => setRenamingProj(null)}>
        <View style={styles.renameModalOverlay}>
          <View style={[styles.renameModalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.renameModalTitle, { color: theme.textPrimary }]}>GANTI NAMA PROJECT</Text>
            <Text style={[styles.label, { color: theme.textFaint }]}>NAMA FILM / PROJECT:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Nama project baru..."
              placeholderTextColor={theme.textFaint}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.cancelBtn, { flex: 1, borderColor: theme.border }]}
                onPress={() => setRenamingProj(null)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700', textAlign: 'center' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1.5, marginTop: 0, backgroundColor: theme.accent }]}
                onPress={handleConfirmRename}
              >
                <Text style={styles.saveBtnText}>SIMPAN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Preset Item Modal */}
      <Modal visible={!!addModal} animationType="fade" transparent onRequestClose={() => setAddModal(null)}>
        <View style={styles.renameModalOverlay}>
          <View style={[styles.renameModalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.renameModalTitle, { color: theme.accent }]}>
              TAMBAH {addModal?.title.toUpperCase()}
            </Text>
            <Text style={[styles.label, { color: theme.textFaint }]}>NAMA / NILAI PRESET BARU:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.textPrimary }]}
              value={addText}
              onChangeText={setAddText}
              placeholder={addModal?.placeholder}
              placeholderTextColor={theme.textFaint}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.cancelBtn, { flex: 1, borderColor: theme.border }]}
                onPress={() => setAddModal(null)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700', textAlign: 'center' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1.5, marginTop: 0, backgroundColor: theme.accent }]}
                onPress={handleConfirmAddPreset}
              >
                <Text style={styles.saveBtnText}>TAMBAH</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Project Picker & Manager Modal (Dropdown Bottom Sheet) */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={styles.projectModalOverlay}>
          <View style={[styles.projectModalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Modal Header */}
            <View style={styles.projectModalHeader}>
              <View>
                <Text style={[styles.projectModalTitle, { color: theme.textPrimary }]}>PILIH PROJECT FILM</Text>
                <Text style={[styles.projectModalSubtitle, { color: theme.textSecondary }]}>
                  {projects.length} project tersimpan di Honglog
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                onPress={() => setShowProjectModal(false)}
              >
                <Feather name="x" size={17} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Quick Create Project Row */}
            <View style={[styles.createProjectBox, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                value={newProjectName}
                onChangeText={setNewProjectName}
                placeholder="Nama film / project baru..."
                placeholderTextColor={theme.textFaint}
              />
              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: theme.accent }]}
                onPress={handleCreateProject}
              >
                <Feather name="plus" size={13} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.createBtnText}>BUAT</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Project List */}
            <ScrollView style={styles.projectModalList} showsVerticalScrollIndicator={false}>
              {projects.map((item) => {
                const isActive = item.id === activeProjectId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.projectCard,
                      {
                        backgroundColor: isActive ? theme.accentWash : theme.surfaceRaised,
                        borderColor: isActive ? theme.accent : theme.border,
                        marginBottom: 8,
                      },
                    ]}
                    onPress={() => handleSelectProject(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.projectInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[styles.projectName, { color: isActive ? theme.accent : theme.textPrimary }]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {isActive && (
                          <View style={[styles.activeBadge, { backgroundColor: theme.accent }]}>
                            <Text style={styles.activeBadgeText}>AKTIF</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.projectMeta, { color: theme.textSecondary }]}>
                        {item.takes.length} takes &bull; {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.projectActionRow}>
                      <TouchableOpacity
                        style={[styles.renameProjectBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setRenamingProj({ id: item.id, name: item.name });
                          setRenameText(item.name);
                        }}
                      >
                        <Feather name="edit-2" size={12} color={theme.textPrimary} />
                        <Text style={[styles.renameProjectText, { color: theme.textPrimary }]}>Ganti Nama</Text>
                      </TouchableOpacity>

                      {!isActive && (
                        <TouchableOpacity
                          onPress={() => handleDeleteProject(item.id, item.name)}
                          style={styles.deleteProjectBtn}
                        >
                          <Text style={[styles.deleteProjectText, { color: theme.danger }]}>Hapus</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
    gap: 14,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: THEME.fontMono,
    fontWeight: '700',
    color: THEME.accent,
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 3,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '700',
    color: THEME.textFaint,
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: THEME.surfaceRaised,
    borderWidth: 1,
    borderColor: THEME.border,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: THEME.textPrimary,
    fontSize: 13,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    marginBottom: 8,
  },
  projectCardActive: {
    borderColor: THEME.accent,
    backgroundColor: THEME.accentWash,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 2,
  },
  projectNameActive: {
    color: THEME.accent,
  },
  projectMeta: {
    fontSize: 11,
    color: THEME.textSecondary,
  },
  activeBadge: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  projectActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  renameProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
  },
  renameProjectText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteProjectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteProjectText: {
    color: THEME.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: THEME.accent,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: THEME.accent,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dangerBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.danger,
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dangerBtnText: {
    color: THEME.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  renameModalSheet: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  renameModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  presetGroup: {
    gap: 8,
  },
  presetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetGroupLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  addPresetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  addPresetBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetChipBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipRemoveIconBtn: {
    padding: 2,
    borderRadius: 4,
  },
  emptyChipHint: {
    fontSize: 11.5,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  projectDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  projectDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  projectIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectDropdownTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  projectDropdownSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  projectDropdownChevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  projectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  projectModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    maxHeight: '85%',
    gap: 12,
  },
  projectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  projectModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  projectModalSubtitle: {
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
  createProjectBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  projectModalList: {
    maxHeight: 380,
  },
});
