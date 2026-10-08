import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from '../store/useHonglogStore';
import { THEME, Project } from '../types';

export const ProjectSetup: React.FC = () => {
  const { meta, updateMeta, clearAllTakes, takes, projects, activeProjectId, createProject, selectProject, deleteProject } = useHonglogStore();

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

  const [camerasText, setCamerasText] = useState(meta.cameras.join(', '));
  const [cardsText, setCardsText] = useState(meta.cards.join(', '));
  const [lensesText, setLensesText] = useState(meta.lenses.join(', '));
  const [shuttersText, setShuttersText] = useState(meta.shutters.join(', '));
  const [filtersText, setFiltersText] = useState(meta.filters.join(', '));
  const [isosText, setIsosText] = useState(meta.isos.join(', '));

  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Nama project tidak boleh kosong');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await createProject(newProjectName.trim());
    setNewProjectName('');
    Alert.alert('Sukses', 'Project baru berhasil dibuat dan dipilih.');
  };

  const handleSelectProject = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await selectProject(id);
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
      setCamerasText(proj.meta.cameras.join(', '));
      setCardsText(proj.meta.cards.join(', '));
      setLensesText(proj.meta.lenses.join(', '));
      setShuttersText(proj.meta.shutters.join(', '));
      setFiltersText(proj.meta.filters.join(', '));
      setIsosText(proj.meta.isos.join(', '));
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
      production,
      prodNumber,
      director,
      dop,
      firstAc,
      secondAc,
      fileFormat,
      aspectRatio,
      lut,
      projectFps,
      cameras: camerasText.split(',').map((s) => s.trim()).filter(Boolean),
      cards: cardsText.split(',').map((s) => s.trim()).filter(Boolean),
      lenses: lensesText.split(',').map((s) => s.trim()).filter(Boolean),
      shutters: shuttersText.split(',').map((s) => s.trim()).filter(Boolean),
      filters: filtersText.split(',').map((s) => s.trim()).filter(Boolean),
      isos: isosText.split(',').map((s) => s.trim()).filter(Boolean),
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

  const renderProjectItem = ({ item }: { item: Project }) => {
    const isActive = item.id === activeProjectId;
    return (
      <View style={[styles.projectCard, isActive && styles.projectCardActive]}>
        <TouchableOpacity 
          style={styles.projectInfo} 
          onPress={() => handleSelectProject(item.id)}
        >
          <Text style={[styles.projectName, isActive && styles.projectNameActive]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.projectMeta}>
            {item.takes.length} takes &bull; {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {isActive ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>AKTIF</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => handleDeleteProject(item.id, item.name)} style={styles.deleteProjectBtn}>
            <Text style={styles.deleteProjectText}>Hapus</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Project Management Section */}
      <Text style={styles.sectionHeader}>MANAJEMEN PROJECT FILM</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>PROJECT AKTIF</Text>
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderProjectItem}
          scrollEnabled={false}
          style={{ marginBottom: 12 }}
        />
        
        <View style={styles.field}>
          <Text style={styles.label}>BUAT PROJECT BARU</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="Nama film / produksi baru..."
              placeholderTextColor={THEME.textFaint}
            />
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateProject}>
              <Text style={styles.createBtnText}>BUAT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>INFORMASI PRODUKSI & KRU</Text>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>JUDUL FILM / PRODUKSI</Text>
          <TextInput
            style={styles.input}
            value={production}
            onChangeText={setProduction}
            placeholder="Cth: Sang Penebus"
            placeholderTextColor={THEME.textFaint}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>PROD. NUMBER</Text>
            <TextInput
              style={styles.input}
              value={prodNumber}
              onChangeText={setProdNumber}
              placeholder="01"
              placeholderTextColor={THEME.textFaint}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>BASE FPS</Text>
            <TextInput
              style={styles.input}
              value={projectFps}
              onChangeText={setProjectFps}
              placeholder="24"
              placeholderTextColor={THEME.textFaint}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>DIRECTOR (SUTRADARA)</Text>
            <TextInput
              style={styles.input}
              value={director}
              onChangeText={setDirector}
              placeholder="Nama Sutradara"
              placeholderTextColor={THEME.textFaint}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>D.O.P</Text>
            <TextInput
              style={styles.input}
              value={dop}
              onChangeText={setDop}
              placeholder="Nama DOP"
              placeholderTextColor={THEME.textFaint}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>1ST AC (FOCUS PULLER)</Text>
            <TextInput
              style={styles.input}
              value={firstAc}
              onChangeText={setFirstAc}
              placeholder="1st AC"
              placeholderTextColor={THEME.textFaint}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>2ND AC (CLAPPER/LOADER)</Text>
            <TextInput
              style={styles.input}
              value={secondAc}
              onChangeText={setSecondAc}
              placeholder="2nd AC"
              placeholderTextColor={THEME.textFaint}
            />
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>SPESIFIKASI FORMAT KAMERA</Text>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>CODEC / FILE FORMAT</Text>
          <TextInput
            style={styles.input}
            value={fileFormat}
            onChangeText={setFileFormat}
            placeholder="ProRes 422 HQ / X-OCN"
            placeholderTextColor={THEME.textFaint}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>ASPECT RATIO</Text>
            <TextInput
              style={styles.input}
              value={aspectRatio}
              onChangeText={setAspectRatio}
              placeholder="1.85:1 / 2.39:1"
              placeholderTextColor={THEME.textFaint}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>LUT</Text>
            <TextInput
              style={styles.input}
              value={lut}
              onChangeText={setLut}
              placeholder="Rec.709 / Film Look"
              placeholderTextColor={THEME.textFaint}
            />
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>PRESET DI SET (PISAHKAN KOMA)</Text>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>KAMERA DI SET</Text>
          <TextInput
            style={styles.input}
            value={camerasText}
            onChangeText={setCamerasText}
            placeholder="A (FX6), B (FX3)"
            placeholderTextColor={THEME.textFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>CARD / ROLL</Text>
          <TextInput
            style={styles.input}
            value={cardsText}
            onChangeText={setCardsText}
            placeholder="A001, B001, C001"
            placeholderTextColor={THEME.textFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PRESET LENSA (MM)</Text>
          <TextInput
            style={styles.input}
            value={lensesText}
            onChangeText={setLensesText}
            placeholder="18, 24, 35, 50, 75, 125"
            placeholderTextColor={THEME.textFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PRESET SHUTTER</Text>
          <TextInput
            style={styles.input}
            value={shuttersText}
            onChangeText={setShuttersText}
            placeholder="180°, 1/48, 1/50, 1/100"
            placeholderTextColor={THEME.textFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PRESET ISO</Text>
          <TextInput
            style={styles.input}
            value={isosText}
            onChangeText={setIsosText}
            placeholder="100, 200, 400, 800, 1600, 3200, 6400"
            placeholderTextColor={THEME.textFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PRESET FILTER / ND</Text>
          <TextInput
            style={styles.input}
            value={filtersText}
            onChangeText={setFiltersText}
            placeholder="Clear, ND3, ND6, Diffusion 1/4"
            placeholderTextColor={THEME.textFaint}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>SIMPAN PENGATURAN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dangerBtn} onPress={handleClearTakes} activeOpacity={0.85}>
        <Text style={styles.dangerBtnText}>Hapus Seluruh Take ({takes.length})</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 10.5,
    fontFamily: THEME.fontMono,
    fontWeight: '700',
    color: THEME.accent,
    letterSpacing: 1.2,
    marginTop: 6,
    marginBottom: 2,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    gap: 10,
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
    borderRadius: 8,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
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
    borderRadius: 8,
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
    borderRadius: 10,
    height: 44,
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
});
