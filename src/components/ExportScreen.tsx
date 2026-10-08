import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useHonglogStore } from '../store/useHonglogStore';
import { generateAndShareCameraReport } from '../services/pdfGenerator';
import { THEME, LIGHT_THEME, ThemeColors } from '../types';

export const ExportScreen: React.FC = () => {
  const { meta, takes, isDarkMode } = useHonglogStore();
  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;
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
      <Text style={[styles.title, { color: theme.accent }]}>EXPORT & CAMERA REPORT</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Download lembar laporan kamera resmi untuk tim DIT, editor, dan pascaproduksi.
      </Text>

      {/* Summary Box */}
      <View style={[styles.summaryBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.sumRow}>
          <Text style={[styles.sumLabel, { color: theme.textFaint }]}>Produksi:</Text>
          <Text style={[styles.sumVal, { color: theme.textPrimary }]}>{meta.production || 'Hong Films Project'}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={[styles.sumLabel, { color: theme.textFaint }]}>Total Take:</Text>
          <Text style={[styles.sumVal, { color: theme.textPrimary }]}>{takes.length} Takes</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={[styles.sumLabel, { color: theme.textFaint }]}>Good Takes (⭐):</Text>
          <Text style={[styles.sumVal, { color: theme.good }]}>{takes.filter((t) => t.isGood).length} Takes</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={[styles.sumLabel, { color: theme.textFaint }]}>DOP / 1st AC:</Text>
          <Text style={[styles.sumVal, { color: theme.textPrimary }]}>
            {meta.dop || '-'} &bull; {meta.firstAc || '-'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.pdfBtn, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
        onPress={handleExportPdf}
        disabled={loadingPdf}
        activeOpacity={0.85}
      >
        {loadingPdf ? (
          <ActivityIndicator color="#000" />
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

      <TouchableOpacity style={[styles.secBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleExportCsv} activeOpacity={0.85}>
        <Text style={styles.secBtnIcon}>📊</Text>
        <View style={styles.pdfBtnTextWrap}>
          <Text style={[styles.secBtnTitle, { color: theme.textPrimary }]}>EXPORT LAPORAN CSV (EXCEL)</Text>
          <Text style={[styles.secBtnSub, { color: theme.textFaint }]}>Tabel data mentah untuk DIT & spreadsheet</Text>
        </View>
      </TouchableOpacity>

      <View style={[styles.infoCard, { backgroundColor: theme.accentWash, borderColor: 'rgba(255, 56, 56, 0.2)' }]}>
        <Text style={[styles.infoTitle, { color: theme.accent }]}>💡 Info Penggunaan di Lokasi Syuting</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
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
    fontFamily: THEME.fontMono,
    fontWeight: '800',
    color: THEME.accent,
    letterSpacing: 1,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  summaryBox: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
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
    color: THEME.textFaint,
    fontWeight: '600',
  },
  sumVal: {
    fontSize: 12,
    color: THEME.textPrimary,
    fontWeight: '700',
  },
  pdfBtn: {
    backgroundColor: THEME.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: THEME.accent,
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
    color: '#000',
    letterSpacing: 0.5,
  },
  pdfBtnSub: {
    fontSize: 11,
    color: '#330000',
    marginTop: 2,
  },
  secBtn: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
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
    color: THEME.textPrimary,
  },
  secBtnSub: {
    fontSize: 11,
    color: THEME.textFaint,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: THEME.accentWash,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 56, 56, 0.2)',
    padding: 14,
    marginTop: 8,
    gap: 6,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.accent,
  },
  infoText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
});
