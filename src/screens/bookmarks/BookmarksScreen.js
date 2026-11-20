import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Screen from '../../components/Screen';
import DetailHeader from '../../components/DetailHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Pill from '../../components/Pill';
import { spacing, radii, typography } from '../../constants/theme';
import { useProgress } from '../../store/progressStore';
import { useTheme } from '../../store/themeStore';

const TYPE_LABELS = {
  ayat: { label: 'Аят', icon: '📖', color: '#0F4C3A' },
  hadith: { label: 'Хадис', icon: '📜', color: '#C9A55B' },
  faq: { label: 'Вопрос', icon: '❓', color: '#5A5A5A' },
  asma: { label: 'Имя Аллаха', icon: '✨', color: '#0F4C3A' },
  ethics: { label: 'Этика', icon: '⚖️', color: '#1E7B5F' },
  sira: { label: 'Сира', icon: '🌹', color: '#B23A48' },
  prophet: { label: 'Пророк', icon: '📜', color: '#3D6E94' },
  dua: { label: 'Дуа', icon: '🤲', color: '#2E7D5B' },
  lesson: { label: 'Урок', icon: '📚', color: '#0F4C3A' },
  free: { label: 'Заметка', icon: '📝', color: '#A68641' },
};

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return '';
  }
}

export default function BookmarksScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, removeBookmark, addNote, updateNote, removeNote } = useProgress();
  const [tab, setTab] = useState('bookmarks');
  const [noteModal, setNoteModal] = useState({ open: false, id: null, text: '' });

  const bookmarks = Object.values(state.bookmarks || {}).sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
  const notes = Object.values(state.notes || {}).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const openBookmark = (b) => {
    if (b.route) {
      navigation.navigate(b.route, b.params || {});
    }
  };

  const confirmRemoveBookmark = (b) => {
    Alert.alert(
      'Удалить закладку?',
      b.title || '',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => removeBookmark(b.type, b.refId) },
      ],
    );
  };

  const openNewNote = () => setNoteModal({ open: true, id: null, text: '' });
  const openEditNote = (n) => setNoteModal({ open: true, id: n.id, text: n.text });
  const closeNote = () => setNoteModal({ open: false, id: null, text: '' });

  const saveNote = () => {
    const text = noteModal.text.trim();
    if (!text) {
      closeNote();
      return;
    }
    if (noteModal.id) {
      updateNote(noteModal.id, { text });
    } else {
      addNote({ text });
    }
    closeNote();
  };

  const confirmRemoveNote = (n) => {
    Alert.alert(
      'Удалить заметку?',
      n.text.slice(0, 80) + (n.text.length > 80 ? '…' : ''),
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => removeNote(n.id) },
      ],
    );
  };

  return (
    <Screen padded={false}>
      <DetailHeader align="center" onBack={() => navigation.goBack()} pattern>
        
        <Text style={styles.title}>Закладки и заметки</Text>
        <Text style={styles.subtitle}>Сохранённое — всегда под рукой</Text>
      </DetailHeader>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setTab('bookmarks')}
          style={[styles.tab, tab === 'bookmarks' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'bookmarks' && styles.tabTextActive]}>
            🔖 Закладки {bookmarks.length > 0 ? `(${bookmarks.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('notes')}
          style={[styles.tab, tab === 'notes' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'notes' && styles.tabTextActive]}>
            📝 Заметки {notes.length > 0 ? `(${notes.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'bookmarks' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {bookmarks.length === 0 ? (
            <EmptyState
              icon="🔖"
              title="Пока нет закладок"
              text={'Нажмите на ☆ в хадисах, аятах, статьях,\nименах Аллаха или историях — и они появятся здесь.'}
            />
          ) : (
            bookmarks.map((b) => {
              const meta = TYPE_LABELS[b.type] || TYPE_LABELS.free;
              return (
                <Card key={`${b.type}:${b.refId}`} style={{ marginBottom: spacing.md }} onPress={() => openBookmark(b)}>
                  <View style={styles.cardRow}>
                    <View style={[styles.iconBox, { backgroundColor: meta.color + '15' }]}>
                      <Text style={{ fontSize: 22 }}>{meta.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Pill label={meta.label} background={meta.color + '15'} textColor={meta.color} />
                      <Text style={styles.bTitle} numberOfLines={2}>{b.title}</Text>
                      {!!b.subtitle && (
                        <Text style={styles.bSub} numberOfLines={2}>{b.subtitle}</Text>
                      )}
                      <Text style={styles.bDate}>{formatDate(b.addedAt)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => confirmRemoveBookmark(b)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text style={styles.removeX}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Button title="＋ Новая заметка" onPress={openNewNote} />
          <View style={{ height: spacing.md }} />
          {notes.length === 0 ? (
            <EmptyState
              icon="📝"
              title="Пока нет заметок"
              text={'Записывайте важное: размышления над аятами,\nдуа, цели, размышления после уроков.'}
            />
          ) : (
            notes.map((n) => (
              <Card key={n.id} style={{ marginBottom: spacing.md }} onPress={() => openEditNote(n)}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    {!!n.title && (
                      <Text style={styles.bTitle} numberOfLines={1}>{n.title}</Text>
                    )}
                    <Text style={styles.noteText} numberOfLines={4}>{n.text}</Text>
                    <Text style={styles.bDate}>{formatDate(n.updatedAt)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmRemoveNote(n)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.removeX}>✕</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {/* Модалка для заметки */}
      <Modal visible={noteModal.open} animationType="slide" transparent onRequestClose={closeNote}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBg}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {noteModal.id ? 'Редактировать заметку' : 'Новая заметка'}
            </Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Текст заметки…"
              placeholderTextColor={colors.textMuted}
              value={noteModal.text}
              onChangeText={(text) => setNoteModal((m) => ({ ...m, text }))}
              autoFocus
            />
            <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Button title="Отмена" variant="ghost" onPress={closeNote} />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Button title="Сохранить" onPress={saveNote} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

function EmptyState({ icon, title, text }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  title: { ...typography.h1, color: '#fff' },
  subtitle: { ...typography.body, color: '#fff', opacity: 0.85, marginTop: 4 },

  tabsRow: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: radii.md, marginHorizontal: 2 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },

  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  bTitle: { ...typography.h4, color: colors.textPrimary, marginTop: 6 },
  bSub: { ...typography.small, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  bDate: { ...typography.caption, color: colors.textMuted, marginTop: 6 },

  noteText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },

  removeX: { fontSize: 18, color: colors.textMuted, paddingHorizontal: 8, paddingTop: 4 },

  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIcon: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
