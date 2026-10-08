import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHonglogStore } from '../store/useHonglogStore';
import { TakeEntry } from '../types';

export const TakesList: React.FC = () => {
  const { takes, deleteTake, updateTake } = useHonglogStore();
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
    <View style={[styles.card, item.isGood && styles.cardGood]}>
      <View style={styles.cardHeader}>
        <View style={styles.slateBadge}>
          <Text style={styles.slateBadgeText}>
            SLATE {item.slate} &bull; SCENE {item.scene} &bull; SHOT {item.shot} &bull; TK {item.take}
          </Text>
        </View>

        <TouchableOpacity onPress={() => handleToggleStar(item)} style={styles.starBtn}>
          <Text style={[styles.starIcon, item.isGood && styles.starIconActive]}>
            {item.isGood ? '★ GOOD' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardSpecs}>
        <Text style={styles.specItem}>
          <Text style={styles.specKey}>CAM: </Text>
          {item.camera || 'A'}
        </Text>
        <Text style={styles.specItem}>
          <Text style={styles.specKey}>ROLL: </Text>
          {item.card}
        </Text>
        <Text style={styles.specItem}>
          <Text style={styles.specKey}>LENS: </Text>
          {item.lens}mm
        </Text>
        <Text style={styles.specItem}>
          <Text style={styles.specKey}>T-STOP: </Text>
          {item.tstop ? 'T' + item.tstop : '-'}
        </Text>
        <Text style={styles.specItem}>
          <Text style={styles.specKey}>ISO: </Text>
          {item.iso}
        </Text>
        <Text style={styles.specItem}>
          <Text style={styles.specKey}>SHUTTER: </Text>
          {item.shutter}
        </Text>
      </View>

      <View style={styles.clipRow}>
        <Text style={styles.clipName}>📁 {item.clipName || 'No Clip ID'}</Text>
        <Text style={styles.timeStr}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {item.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.delBtn}
        onPress={() => handleDelete(item.id, `Scene ${item.scene} Take ${item.take}`)}
      >
        <Text style={styles.delText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{takes.length}</Text>
          <Text style={styles.statLbl}>TOTAL TAKES</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#5FBF77' }]}>{takes.filter((t) => t.isGood).length}</Text>
          <Text style={styles.statLbl}>GOOD TAKES</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#FF8A3D' }]}>{new Set(takes.map((t) => t.scene)).size}</Text>
          <Text style={styles.statLbl}>SCENES</Text>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari scene / clip / catatan..."
          placeholderTextColor="#63656D"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={[styles.filterBtn, filterGood && styles.filterBtnActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterGood(!filterGood);
          }}
        >
          <Text style={[styles.filterBtnText, filterGood && styles.filterBtnTextActive]}>
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
            <Text style={styles.emptyTitle}>Belum ada Take</Text>
            <Text style={styles.emptyDesc}>Buka tab "Slate" untuk mulai logging take kamera.</Text>
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
    backgroundColor: '#17171C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2D35',
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F4F3EE',
    fontFamily: 'Courier',
  },
  statLbl: {
    fontSize: 9,
    color: '#63656D',
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
    backgroundColor: '#17171C',
    borderWidth: 1,
    borderColor: '#2C2D35',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    color: '#F4F3EE',
    fontSize: 12.5,
  },
  filterBtn: {
    paddingHorizontal: 12,
    height: 38,
    backgroundColor: '#1F2026',
    borderWidth: 1,
    borderColor: '#2C2D35',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(95, 191, 119, 0.15)',
    borderColor: '#5FBF77',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9FA1A8',
  },
  filterBtnTextActive: {
    color: '#5FBF77',
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    backgroundColor: '#17171C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2D35',
    padding: 12,
  },
  cardGood: {
    borderColor: 'rgba(95, 191, 119, 0.4)',
    backgroundColor: 'rgba(95, 191, 119, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slateBadge: {
    backgroundColor: '#1F2026',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3D3F4A',
  },
  slateBadgeText: {
    color: '#FF8A3D',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  starBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  starIcon: {
    fontSize: 13,
    color: '#63656D',
    fontWeight: '700',
  },
  starIconActive: {
    color: '#5FBF77',
  },
  cardSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  specItem: {
    fontSize: 11,
    color: '#F4F3EE',
  },
  specKey: {
    color: '#63656D',
    fontWeight: '700',
  },
  clipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#262730',
  },
  clipName: {
    fontSize: 11.5,
    fontFamily: 'Courier',
    color: '#9FA1A8',
  },
  timeStr: {
    fontSize: 10,
    color: '#63656D',
  },
  notesBox: {
    marginTop: 6,
    backgroundColor: '#1F2026',
    borderRadius: 6,
    padding: 6,
  },
  notesText: {
    fontSize: 11.5,
    color: '#D4D4D8',
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
    color: '#E0625A',
  },
  emptyWrap: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F3EE',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#63656D',
    textAlign: 'center',
  },
});
