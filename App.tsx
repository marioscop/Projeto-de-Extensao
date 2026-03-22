import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDb } from './src/database/db';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const setupDb = async () => {
      try {
        await initDb();
        if (isMounted) setDbReady(true);
      } catch (e) {
        console.error("DB Init error:", e);
      }
    };
    setupDb();
    return () => { isMounted = false; };
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2f95dc" />
        <Text>Carregando Base de Dados...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
