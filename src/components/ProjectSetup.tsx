import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from '../store/useHonglogStore';

export const ProjectSetup: React.FC = () => {
  const { meta, updateMeta, clearAllTakes, takes } = useHonglogStore();

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeader}>INFORMASI PRODUKSI & KRU</Text>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>JUDUL FILM / PRODUKSI</Text>
          <TextInput
            style={styles.input}
            value={production}
            onChangeText={setProduction}
            placeholder="Cth: Sang Penebus"
            placeholderTextColor="#63656D"
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
              placeholderTextColor="#63656D"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>BASE FPS</Text>
            <TextInput
              style={styles.input}
              value={projectFps}
              onChangeText={setProjectFps}
              placeholder="24"
              placeholderTextColor="#63656D"
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
              placeholderTextColor="#63656D"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>D.O.P</Text>
            <TextInput
              style={styles.input}
              value={dop}
              onChangeText={setDop}
              placeholder="Nama DOP"
              placeholderTextColor="#63656D"
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
              placeholderTextColor="#63656D"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>2ND AC (CLAPPER/LOADER)</Text>
            <TextInput
              style={styles.input}
              value={secondAc}
              onChangeText={setSecondAc}
              placeholder="2nd AC"
              placeholderTextColor="#63656D"
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
            placeholderTextColor="#63656D"
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
              placeholderTextColor="#63656D"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>LUT</Text>
            <TextInput
              style={styles.input}
              value={lut}
              onChangeText={setLut}
              placeholder="Rec.709 / Film Look"
              placeholderTextColor="#63656D"
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
            placeholderTextColor="#63656D"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>CARD / ROLL</Text>
          <TextInput
            style={styles.input}
            value={cardsText}
            onChangeText={setCardsText}
            placeholder="A001, B001, C001"
            placeholderTextColor="#63656D"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PRESET LENSA (MM)</Text>
          <TextInput
            style={styles.input}
            value={lensesText}
            onChangeText={setLensesText}
            placeholder="18, 24, 35, 50, 75, 125"
            placeholderTextColor="#63656D"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PRESET SHUTTER</Text>
          <TextInput
            style={styles.input}
            value={shuttersText}
            onChangeText={setShuttersText}
            placeholder="180°, 1/48, 1/50, 1/100"
            placeholderTextColor="#63656D"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PRESET ISO</Text>
          <TextInput
            style={styles.input}
            value={isosText}
            onChangeText={setIsosText}
            placeholder="100, 200, 400, 800, 1600, 3200, 6400"
            placeholderTextColor="#63656D"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PRESET FILTER / ND</Text>
          <TextInput
            style={styles.input}
            value={filtersText}
            onChangeText={setFiltersText}
            placeholder="Clear, ND3, ND6, Diffusion 1/4"
            placeholderTextColor="#63656D"
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
    fontFamily: 'Courier',
    fontWeight: '700',
    color: '#FF8A3D',
    letterSpacing: 1.2,
    marginTop: 6,
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#17171C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2D35',
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
    color: '#63656D',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: '#1F2026',
    borderWidth: 1,
    borderColor: '#2C2D35',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#F4F3EE',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#FF8A3D',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#120d06',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dangerBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0625A',
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dangerBtnText: {
    color: '#E0625A',
    fontSize: 12,
    fontWeight: '700',
  },
});
