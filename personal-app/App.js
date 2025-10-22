import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import NotesScreen from './screens/NotesScreen';
import TrackingScreen from './screens/TrackingScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const navigationRef = useRef();
  const responseListener = useRef();
  const [pendingNoteId, setPendingNoteId] = useState(null);

  useEffect(() => {
    // Global notification response handler for APK builds
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const noteId = response.notification.request.content.data.noteId;
      console.log('Global notification response received, noteId:', noteId);
      
      if (noteId && navigationRef.current) {
        // Navigate to Notes tab first
        navigationRef.current.navigate('Notes');
        
        // Store the noteId to pass to NotesScreen
        setPendingNoteId(noteId);
      }
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleNoteOpened = () => {
    setPendingNoteId(null);
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Notes') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Tracking') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Notes">
          {(props) => (
            <NotesScreen 
              {...props} 
              pendingNoteId={pendingNoteId} 
              onNoteOpened={handleNoteOpened}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Tracking" component={TrackingScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

