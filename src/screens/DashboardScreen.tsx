import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { getDashboardStats } from '../database/db';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const route = useRoute<any>();
  const operator = route.params?.operator || 'Operador';
  const initialCash = route.params?.initialCash || 0;
  
  const [stats, setStats] = useState({ todaySales: 0, lowStockCount: 0 });

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadStats = async () => {
        const data = await getDashboardStats();
        if (isMounted) setStats(data);
      };
      loadStats();
      return () => { isMounted = false; };
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Olá, {operator}!</Text>
        <Text style={styles.subtitle}>Acompanhe suas vendas e estoque de hoje</Text>
      </View>

      <View style={styles.cardsContainer}>
        
        {/* Card Fundo de Caixa */}
        <View style={[styles.card, { backgroundColor: '#e8f5e9', width: '100%', marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25 }]}>
          <View>
            <Text style={styles.cardTitle}>Fundo de Caixa (Troco)</Text>
            <Text style={styles.cardValue}>R$ {initialCash.toFixed(2)}</Text>
          </View>
          <Ionicons name="wallet-outline" size={40} color="#2e7d32" />
        </View>

        <View style={styles.rowStyle}>
          <View style={[styles.card, { backgroundColor: '#e0f7fa', width: '48%' }]}>
            <Ionicons name="cash-outline" size={32} color="#00838f" />
            <Text style={styles.cardTitle}>Vendas Hoje</Text>
            <Text style={styles.cardValue}>
              R$ {stats.todaySales.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#ffebee', width: '48%' }]}>
            <Ionicons name="warning-outline" size={32} color="#c62828" />
            <Text style={styles.cardTitle}>Estoque Baixo</Text>
            <Text style={styles.cardValue}>{stats.lowStockCount} Itens</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#2f95dc',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  cardsContainer: {
    padding: 20,
  },
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
});

