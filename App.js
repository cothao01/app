import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, LogBox, Text, ScrollView, Platform } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreLogs(['new NativeEventEmitter']);

class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FFF5F7' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F44336', marginBottom: 12 }}>
            Something went wrong
          </Text>
          <ScrollView>
            <Text style={{ fontSize: 14, color: '#333', fontFamily: 'monospace' }}>
              {this.state.error.toString()}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { theme } = useTheme();
  const { loading } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F7' }}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={{ marginTop: 16, color: '#FF69B4', fontSize: 18, fontWeight: '700' }}>Loading Baby Tracker...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.statusBar === 'dark-content' ? 'dark' : 'light'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
