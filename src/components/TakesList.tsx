import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from '../store/useHonglogStore';
import { TakeEntry, THEME, LIGHT_THEME, ThemeColors } from '../types';

export const TakesList: React.FC = () => {
  const { takes, deleteTake, updateTake, isDarkMode } = useHonglogStore();
  const theme: ThemeColors = isDarkMode ? THEME : LIGHT_THEME;
  const [filterGood, setFilterGood] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTakes = takes.filter((t) => {
    if (filterGood && !t.isGood) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchScene = t.scene.toLowerCase().includes(q);
      const matchClip = t.clipName.toLowerCase().includes(q);
      const matchNotes = t.notes.toLowerCase().includes(q);
      return matchScene || matchClip || matchNotes;
    }
    return true;
  });

  const handleDelete = (id: string, label: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Hapus Take', `Yakin hapus ${label}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteTake(id);
        },
      },
    ]);
  };

  const handleToggleStar = (t: TakeEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateTake(t.id, { isGood: !t.isGood });
  };

  const renderItem = ({ item }: { item: TakeEntry }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: item.isGood ? theme.good : theme.border }, item.isGood && { backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.05)' : 'rgba(34, 197, 94, 0.05)' }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.slateBadge, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderLight }]}>
          <Text style={[styles.slateBadgeText, { color: theme.accent }]}>
            SLATE {item.slate} &bull; SCENE {item.scene} &bull; SHOT {item.shot} &bull; TK {item.take}
          </Text>
        </View>

        <TouchableOpacity onPress={() => handleToggleStar(item)} style={styles.starBtn}>
          <Text style={[styles.starIcon, { color: item.isGood ? theme.good : theme.textFaint }]}>
            {item.isGood ? '★ GOOD' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardSpecs}>
        <Text style={[styles.specItem, { color: theme.textPrimary }]}>
          <Text style={[styles.specKey, { color: theme.textFaint }]}>CAM: </Text>
          {item.camera || 'A'}
        </Text>
        <Text style={[styles.specItem, { color: theme.textPrimary }]}>
          <Text style={[styles.specKey, { color: theme.textFaint }]}>ROLL: </Text>
          {item.card}
        </Text>
        <Text style={[styles.specItem, { color: theme.textPrimary }]}>
          <Text style={[styles.specKey, { color: theme.textFaint }]}>LENS: </Text>
          {item.lens}mm
        </Text>
        <Text style={[styles.specItem, { color: theme.textPrimary }]}>
          <Text style={[styles.specKey, { color: theme.textFaint }]}>T-STOP: </Text>
          {item.tstop ? 'T' + item.tstop : '-'}
        </Text>
        <Text style={[styles.specItem, { color: theme.textPrimary }]}>
          <Text style={[styles.specKey, { color: theme.textFaint }]}>ISO: </Text>
          {item.iso}
        </Text>
        <Text style={[styles.specItem, { color: theme.textPrimary }]}>
          <Text style={[styles.specKey, { color: theme.textFaint }]}>SHUTTER: </Text>
          {item.shutter}
        </Text>
      </View>

      <View style={styles.clipRow}>
        <Text style={[styles.clipName, { color: theme.textSecondary }]}>📁 {item.clipName || 'No Clip ID'}</Text>
        <Text style={[styles.timeStr, { color: theme.textFaint }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {item.notes ? (
        <View style={[styles.notesBox, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
          <Text style={[styles.notesText, { color: theme.textSecondary }]}>{item.notes}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.delBtn, { borderColor: theme.danger }]}
        onPress={() => handleDelete(item.id, `Scene ${item.scene} Take ${item.take}`)}
      >
        <Text style={[styles.delText, { color: theme.danger }]}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.textPrimary }]}>{takes.length > 0 ? Math.max(...takes.map(t => t.slate)) : 0}</Text>
          <Text style={[styles.statLbl, { color: theme.textFaint }]}>SLATE TERAKHIR</Text>
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

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Cari scene / clip / catatan..."
          placeholderTextColor={theme.textFaint}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: theme.surfaceRaised, borderColor: filterGood ? theme.good : theme.border }, filterGood && { backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterGood(!filterGood);
          }}
        >
          <Text style={[styles.filterBtnText, { color: filterGood ? theme.good : theme.textSecondary }]}>
            {filterGood ? '★ Good Only' : 'Semua'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredTakes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Belum ada Take</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>Buka tab "Slate" untuk mulai logging take kamera.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textPrimary,
    fontFamily: THEME.fontMono,
  },
  statLbl: {
    fontSize: 9,
    color: THEME.textFaint,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    color: THEME.textPrimary,
    fontSize: 12.5,
  },
  filterBtn: {
    paddingHorizontal: 12,
    height: 38,
    backgroundColor: THEME.surfaceRaised,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: THEME.good,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  filterBtnTextActive: {
    color: THEME.good,
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
  },
  cardGood: {
    borderColor: 'rgba(74, 222, 128, 0.4)',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slateBadge: {
    backgroundColor: THEME.surfaceRaised,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  slateBadgeText: {
    color: THEME.accent,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: THEME.fontMono,
  },
  starBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  starIcon: {
    fontSize: 13,
    color: THEME.textFaint,
    fontWeight: '700',
  },
  starIconActive: {
    color: THEME.good,
  },
  cardSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  specItem: {
    fontSize: 11,
    color: THEME.textPrimary,
  },
  specKey: {
    color: THEME.textFaint,
    fontWeight: '700',
  },
  clipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  clipName: {
    fontSize: 11.5,
    fontFamily: THEME.fontMono,
    color: THEME.textSecondary,
  },
  timeStr: {
    fontSize: 10,
    color: THEME.textFaint,
  },
  notesBox: {
    marginTop: 6,
    backgroundColor: THEME.surfaceRaised,
    borderRadius: 6,
    padding: 6,
  },
  notesText: {
    fontSize: 11.5,
    color: THEME.textSecondary,
    fontStyle: 'italic',
  },
  delBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  delText: {
    fontSize: 10,
    color: THEME.danger,
  },
  emptyWrap: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  emptyDesc: {
    fontSize: 12,
    color: THEME.textFaint,
    textAlign: 'center',
  },
});
