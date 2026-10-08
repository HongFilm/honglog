import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useHonglogStore } from '../store/useHonglogStore';
import { generateAndShareCameraReport } from '../services/pdfGenerator';

export const ExportScreen: React.FC = () => {
  const { meta, takes } = useHonglogStore();
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleExportPdf = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoadingPdf(true);
      await generateAndShareCameraReport(meta, takes);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
      Alert.alert('Gagal Export', 'Terjadi kesalahan saat membuat file PDF Camera Report.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const headers = 'Slate,Scene,Shot,Take,Good,Clip Name,Camera,Card,Lens,Shutter,ISO,T-Stop,Filter,FPS,Notes,Time\n';
      const rows = takes
        .map((t) =>
          [
            t.slate,
            `"${t.scene}"`,
            `"${t.shot}"`,
            t.take,
            t.isGood ? 'YES' : 'NO',
            `"${t.clipName || ''}"`,
            `"${t.camera || ''}"`,
            `"${t.card || ''}"`,
            `"${t.lens || ''}"`,
            `"${t.shutter || ''}"`,
            `"${t.iso || ''}"`,
            `"${t.tstop || ''}"`,
            `"${t.filter || ''}"`,
            `"${t.fps || ''}"`,
            `"${(t.notes || '').replace(/"/g, '""')}"`,
            `"${new Date(t.timestamp).toISOString()}"`,
          ].join(',')
        )
        .join('\n');

      const csvContent = headers + rows;
      // In web or sharing:
      Alert.alert('CSV Ready', `CSV berhasil di-generate dengan ${takes.length} baris data.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>EXPORT & CAMERA REPORT</Text>
      <Text style={styles.subtitle}>
        Download lembar laporan kamera resmi untuk tim DIT, editor, dan pascaproduksi.
      </Text>

      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Produksi:</Text>
          <Text style={styles.sumVal}>{meta.production || 'Hong Films Project'}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Total Take:</Text>
          <Text style={styles.sumVal}>{takes.length} Takes</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Good Takes (⭐):</Text>
          <Text style={[styles.sumVal, { color: '#5FBF77' }]}>{takes.filter((t) => t.isGood).length} Takes</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>DOP / 1st AC:</Text>
          <Text style={styles.sumVal}>
            {meta.dop || '-'} &bull; {meta.firstAc || '-'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.pdfBtn}
        onPress={handleExportPdf}
        disabled={loadingPdf}
        activeOpacity={0.85}
      >
        {loadingPdf ? (
          <ActivityIndicator color="#120d06" />
        ) : (
          <>
            <Text style={styles.pdfBtnIcon}>📄</Text>
            <View style={styles.pdfBtnTextWrap}>
              <Text style={styles.pdfBtnTitle}>EXPORT & SHARE PDF REPORT</Text>
              <Text style={styles.pdfBtnSub}>Kirim via AirDrop, WhatsApp, Google Drive atau Simpan ke File</Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secBtn} onPress={handleExportCsv} activeOpacity={0.85}>
        <Text style={styles.secBtnIcon}>📊</Text>
        <View style={styles.pdfBtnTextWrap}>
          <Text style={styles.secBtnTitle}>EXPORT LAPORAN CSV (EXCEL)</Text>
          <Text style={styles.secBtnSub}>Tabel data mentah untuk DIT & spreadsheet</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Info Penggunaan di Lokasi Syuting</Text>
        <Text style={styles.infoText}>
          Honglog dirancang offline-first. Anda dapat menggunakan aplikasi tanpa sinyal internet sama sekali di hutan,
          gunung, atau studio tertutup. Semua take tersimpan secara lokal dan dapat di-export kapan saja.
        </Text>
      </View>
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
  title: {
    fontSize: 14,
    fontFamily: 'Courier',
    fontWeight: '800',
    color: '#FF8A3D',
    letterSpacing: 1,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9FA1A8',
    lineHeight: 18,
  },
  summaryBox: {
    backgroundColor: '#17171C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2D35',
    padding: 14,
    gap: 8,
    marginVertical: 4,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumLabel: {
    fontSize: 11.5,
    color: '#63656D',
    fontWeight: '600',
  },
  sumVal: {
    fontSize: 12,
    color: '#F4F3EE',
    fontWeight: '700',
  },
  pdfBtn: {
    backgroundColor: '#FF8A3D',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#FF8A3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfBtnIcon: {
    fontSize: 26,
  },
  pdfBtnTextWrap: {
    flex: 1,
  },
  pdfBtnTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#120d06',
    letterSpacing: 0.5,
  },
  pdfBtnSub: {
    fontSize: 11,
    color: '#3d250f',
    marginTop: 2,
  },
  secBtn: {
    backgroundColor: '#17171C',
    borderWidth: 1,
    borderColor: '#2C2D35',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secBtnIcon: {
    fontSize: 24,
  },
  secBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F3EE',
  },
  secBtnSub: {
    fontSize: 11,
    color: '#63656D',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 138, 61, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 61, 0.2)',
    padding: 14,
    marginTop: 8,
    gap: 6,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF8A3D',
  },
  infoText: {
    fontSize: 11.5,
    color: '#9FA1A8',
    lineHeight: 18,
  },
});
