import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getProducts, updateProduct, deleteProduct, Product } from '../database/db';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const openAddScreen = () => {
    navigation.navigate('ProductForm');
  };

  const openEditScreen = (product: Product) => {
    navigation.navigate('ProductForm', { product });
  };

  const handleDelete = (id: number, productName: string) => {
    Alert.alert(
      'Atenção',
      `Tem certeza que deseja excluir '${productName}'? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(id);
            loadData();
          } 
        }
      ]
    );
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto por nome..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.cardInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
            </View>
            
            <View style={styles.cardActions}>
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>{item.quantity} un.</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openEditScreen(item)}>
                <Ionicons name="pencil" size={20} color="#f57c00" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id, item.name)}>
                <Ionicons name="trash" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto encontrado no estoque.</Text>}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddScreen}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    margin: 15, paddingHorizontal: 15, borderRadius: 8, elevation: 2, height: 45
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 16 },
  listContainer: { paddingHorizontal: 15, paddingBottom: 80 },
  productCard: {
    backgroundColor: '#fff', padding: 15, borderRadius: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10, elevation: 1
  },
  cardInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  productPrice: { fontSize: 14, color: '#666', marginTop: 5 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  stockBadge: { backgroundColor: '#e0e0e0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 10 },
  stockText: { fontWeight: 'bold', color: '#333', fontSize: 12 },
  iconBtn: { padding: 5, marginLeft: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: '#2f95dc', width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 4
  }
});


