import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Feather } from '@expo/vector-icons';
import { useHonglogStore } from '../store/useHonglogStore';
import { generateAndShareCameraReport } from '../services/pdfGenerator';
import { THEME, LIGHT_THEME, ThemeColors } from '../types';

export const ExportScreen: React.FC = () => {
  const { meta, takes, isDarkMode } = useHonglogStore();
  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);

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
      setLoadingCsv(true);

      const headers = 'Slate,Scene,Shot,Take,Location,Lighting,Status,Clip Name,Camera,Roll/Card,Lens,T-Stop,Shutter,ISO,Filter,FPS,Notes,Timestamp,Date\n';
      const sortedTakes = [...takes].sort((a, b) => {
        if (a.slate !== b.slate) return a.slate - b.slate;
        return a.take - b.take;
      });

      const rows = sortedTakes
        .flatMap((t) => {
          const statusStr = t.status || (t.isGood ? 'PRINT' : 'HOLD');
          const timeIso = new Date(t.timestamp).toISOString();
          const dateLocal = new Date(t.timestamp).toLocaleDateString('id-ID');
          const locStr = t.intExt || 'INT';
          const lightStr = t.dayNight || 'DAY';

          if (t.cameras && t.cameras.length > 1) {
            return t.cameras.map((c) =>
              [
                t.slate,
                `"${t.scene}"`,
                `"${t.shot}"`,
                t.take,
                `"${locStr}"`,
                `"${lightStr}"`,
                `"${statusStr}"`,
                `"${c.clipName || ''}"`,
                `"${c.camera || ''}"`,
                `"${c.card || ''}"`,
                `"${c.lens ? c.lens + 'mm' : ''}"`,
                `"${c.tstop ? 'T' + c.tstop : ''}"`,
                `"${c.shutter || t.shutter || ''}"`,
                `"${c.iso || t.iso || ''}"`,
                `"${c.filter || t.filter || ''}"`,
                `"${c.fps || t.fps || ''}"`,
                `"${(t.notes || '').replace(/"/g, '""')}"`,
                `"${timeIso}"`,
                `"${dateLocal}"`,
              ].join(',')
            );
          }

          return [
            [
              t.slate,
              `"${t.scene}"`,
              `"${t.shot}"`,
              t.take,
              `"${locStr}"`,
              `"${lightStr}"`,
              `"${statusStr}"`,
              `"${t.clipName || ''}"`,
              `"${t.camera || ''}"`,
              `"${t.card || ''}"`,
              `"${t.lens ? t.lens + 'mm' : ''}"`,
              `"${t.tstop ? 'T' + t.tstop : ''}"`,
              `"${t.shutter || ''}"`,
              `"${t.iso || ''}"`,
              `"${t.filter || ''}"`,
              `"${t.fps || ''}"`,
              `"${(t.notes || '').replace(/"/g, '""')}"`,
              `"${timeIso}"`,
              `"${dateLocal}"`,
            ].join(','),
          ];
        })
        .join('\n');

      const csvData = headers + rows;
      const cleanProd = (meta.production || 'honglog').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filename = `${cleanProd}_camera_report_${Date.now()}.csv`;
      const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
      const fileUri = `${baseDir}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Share CSV Camera Report',
          UTI: 'public.comma-separated-values-text',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Sukses', `File CSV tersimpan di ${fileUri}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Gagal Export CSV', 'Terjadi kesalahan saat membuat atau membagikan file CSV.');
    } finally {
      setLoadingCsv(false);
    }
  };

  const totalSlates = takes.length > 0 ? new Set(takes.map((t) => t.slate)).size : 0;
  const printTakesCount = takes.filter((t) => t.status === 'PRINT' || t.isGood).length;

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
          <Text style={[styles.sumLabel, { color: theme.textFaint }]}>Total Slate:</Text>
          <Text style={[styles.sumVal, { color: theme.textPrimary }]}>{totalSlates} Slate ({takes.length} Takes)</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={[styles.sumLabel, { color: theme.textFaint }]}>Print Takes:</Text>
          <Text style={[styles.sumVal, { color: theme.good }]}>{printTakesCount} Takes</Text>
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
        disabled={loadingPdf || loadingCsv}
        activeOpacity={0.85}
      >
        {loadingPdf ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Feather name="file-text" size={22} color="#000" />
            <View style={styles.pdfBtnTextWrap}>
              <Text style={styles.pdfBtnTitle}>EXPORT & SHARE PDF REPORT</Text>
              <Text style={styles.pdfBtnSub}>Kirim via AirDrop, WhatsApp, Google Drive atau Simpan ke File</Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={handleExportCsv}
        disabled={loadingPdf || loadingCsv}
        activeOpacity={0.85}
      >
        {loadingCsv ? (
          <ActivityIndicator color={theme.accent} />
        ) : (
          <>
            <Feather name="grid" size={20} color={theme.textPrimary} />
            <View style={styles.pdfBtnTextWrap}>
              <Text style={[styles.secBtnTitle, { color: theme.textPrimary }]}>EXPORT LAPORAN CSV (EXCEL / DIT)</Text>
              <Text style={[styles.secBtnSub, { color: theme.textFaint }]}>File spreadsheet tabel data mentah untuk DIT & editor</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
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
  title: {
    fontSize: 16,
    fontFamily: THEME.fontMono,
    fontWeight: '800',
    color: THEME.accent,
    letterSpacing: 1,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  summaryBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginVertical: 6,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  sumVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  pdfBtn: {
    minHeight: 72,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
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
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  secBtnSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
