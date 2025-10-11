import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useFonts, GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { AlexBrush_400Regular } from '@expo-google-fonts/alex-brush';

const NOTES_STORAGE_KEY = '@notes_data';
const NOTIFICATION_INTERVAL_MINUTES = 180; // 3 hours

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [showNoteViewer, setShowNoteViewer] = useState(false);
  
  const notificationListener = useRef();
  const responseListener = useRef();

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    GreatVibes_400Regular,
    AlexBrush_400Regular,
  });

  useEffect(() => {
    loadNotes();
    registerForPushNotificationsAsync();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    // Setup notification received listener - reschedule when notification fires
    if (notificationListener.current) {
      Notifications.removeNotificationSubscription(notificationListener.current);
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      console.log('Current notes count:', notes.length);
      // Automatically schedule next notification at a random time
      if (notes.length > 0) {
        scheduleRandomNotification();
      }
    });

    // Setup notification response listener when notes change
    if (responseListener.current) {
      Notifications.removeNotificationSubscription(responseListener.current);
    }

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const noteId = response.notification.request.content.data.noteId;
      console.log('Notification tapped, noteId:', noteId);
      console.log('Current notes:', notes.length);
      
      if (noteId && notes.length > 0) {
        const note = notes.find(n => n.id === noteId);
        console.log('Found note:', note);
        if (note) {
          openNoteViewer(note);
        }
      }
    });

    // Start random notification cycle when notes change
    if (notes.length > 0) {
      scheduleRandomNotification();
    }
  }, [notes]);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (data) {
        setNotes(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (notesData) => {
    try {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesData));
      setNotes(notesData);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addNote = () => {
    if (!noteTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    resetForm();
  };

  const updateNote = () => {
    if (!noteTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const updated = notes.map((note) => {
      if (note.id === editingNote.id) {
        return {
          ...note,
          title: noteTitle.trim(),
          content: noteContent.trim(),
          updatedAt: new Date().toISOString(),
        };
      }
      return note;
    });

    saveNotes(updated);
    resetForm();
  };

  const deleteNote = (noteId) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = notes.filter((note) => note.id !== noteId);
          saveNotes(updated);
        },
      },
    ]);
  };

  const openEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowAddNote(true);
  };

  const openNoteViewer = (note) => {
    setViewingNote(note);
    setShowNoteViewer(true);
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
    setShowAddNote(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Request notification permissions
  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications to receive note reminders!');
        setNotificationPermission(false);
        return;
      }
      setNotificationPermission(true);
    } else {
      Alert.alert('Error', 'Must use physical device for notifications');
    }

    return token;
  };

  // Schedule a notification at a random time within the interval
  const scheduleRandomNotification = async () => {
    if (notes.length === 0) return;

    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Calculate random time in seconds (0 to NOTIFICATION_INTERVAL_MINUTES * 60)
    const maxSeconds = NOTIFICATION_INTERVAL_MINUTES * 60;
    const randomSeconds = Math.floor(Math.random() * maxSeconds);

    // Pick a random note
    const randomNote = notes[Math.floor(Math.random() * notes.length)];

    // Schedule notification at the random time (NOT repeating)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 ' + randomNote.title,
        body: randomNote.content || 'Tap to view this note',
        data: { noteId: randomNote.id },
      },
      trigger: {
        seconds: randomSeconds,
        repeats: false, // Don't repeat - we'll reschedule after it fires
      },
    });

    console.log(`Notification scheduled in ${randomSeconds} seconds (${(randomSeconds / 60).toFixed(1)} minutes)`);
  };

  // Send immediate test notification with a random note
  const sendTestNotification = async () => {
    if (notes.length === 0) {
      Alert.alert('No Notes', 'Please add some notes first!');
      return;
    }

    // Pick a random note
    const randomNote = notes[Math.floor(Math.random() * notes.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 ' + randomNote.title,
        body: randomNote.content || 'Tap to view this note',
        data: { noteId: randomNote.id },
      },
      trigger: null, // Send immediately
    });

    Alert.alert('Success', 'Test notification sent!');
  };

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSpacer} />
      <ScrollView style={styles.scrollView}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateText}>No notes yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add your first note
            </Text>
          </View>
        ) : (
          <View style={styles.notesContainer}>
            {notes.map((note) => (
              <TouchableOpacity
                key={note.id}
                style={styles.noteCard}
                onPress={() => openEditNote(note)}
              >
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {note.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteNote(note.id)}
                    style={styles.deleteIconButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#f44336" />
                  </TouchableOpacity>
                </View>
                {note.content ? (
                  <Text style={styles.noteContent} numberOfLines={3}>
                    {note.content}
                  </Text>
                ) : (
                  <Text style={styles.noteContentEmpty}>No content</Text>
                )}
                <Text style={styles.noteDate}>
                  {formatDate(note.updatedAt)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Test Notification Button (Bottom Left) */}
      <TouchableOpacity
        style={styles.testNotificationFab}
        onPress={sendTestNotification}
      >
        <Ionicons name="notifications" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Add Note Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddNote(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Note Modal */}
      <Modal
        visible={showAddNote}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNote ? 'Edit Note' : 'Add Note'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="Note Title"
              value={noteTitle}
              onChangeText={setNoteTitle}
              maxLength={100}
            />

            <TextInput
              style={styles.contentInput}
              placeholder="Note Content (optional)"
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingNote ? updateNote : addNote}
            >
              <Text style={styles.saveButtonText}>
                {editingNote ? 'Update Note' : 'Add Note'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Beautiful Note Viewer Modal */}
      <Modal
        visible={showNoteViewer}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setShowNoteViewer(false)}
      >
        {viewingNote && (
          <ImageBackground
            source={require('../assets/old-parchment-template.jpg')}
            style={styles.fullScreenLetter}
            resizeMode="stretch"
            imageStyle={styles.parchmentImage}
          >
            <View style={styles.parchmentContent}>
              <Text style={styles.parchmentTitle}>
                {viewingNote.title}
              </Text>

              <View style={styles.parchmentDivider} />

              {viewingNote.content ? (
                <ScrollView 
                  style={styles.parchmentBodyScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.parchmentBodyContent}
                >
                  <Text style={styles.parchmentBody}>
                    {viewingNote.content}
                  </Text>
                </ScrollView>
              ) : (
                <View style={styles.parchmentBodyScroll}>
                  <Text style={styles.parchmentEmptyText}>
                    ✨ This note awaits your thoughts ✨
                  </Text>
                </View>
              )}
            </View>
          </ImageBackground>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topSpacer: {
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 20,
    color: '#999',
    marginTop: 20,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  notesContainer: {
    padding: 15,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  deleteIconButton: {
    padding: 5,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteContentEmpty: {
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  testNotificationFab: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 150,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullScreenLetter: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  parchmentImage: {
    width: '100%',
    height: '100%',
  },
  parchmentContent: {
    flex: 1,
    padding: 40,
    paddingTop: 100,
    paddingBottom: 60,
  },
  parchmentTitle: {
    fontSize: 48,
    color: '#2C1810',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    fontFamily: 'GreatVibes_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  parchmentDivider: {
    height: 2,
    backgroundColor: '#8B6F47',
    width: '50%',
    alignSelf: 'center',
    marginBottom: 30,
    opacity: 0.6,
  },
  parchmentBodyScroll: {
    flex: 1,
  },
  parchmentBodyContent: {
    paddingBottom: 20,
  },
  parchmentBody: {
    fontSize: 24,
    lineHeight: 36,
    color: '#3D2817',
    textAlign: 'left',
    fontFamily: 'AlexBrush_400Regular',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
  },
  parchmentEmptyText: {
    fontSize: 24,
    color: '#6B5744',
    textAlign: 'center',
    fontFamily: 'AlexBrush_400Regular',
    marginTop: 60,
  },
});

