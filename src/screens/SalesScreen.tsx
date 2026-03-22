// ==========================================
// TELA DE PDV / FRENTE DE CAIXA
// Sem dúvida a página mais desafiadora do projeto de extensão!
// Tive que integrar o 'expo-camera' para leitura real de Código de Barras (QR/EAN),
// usar filtro de pesquisa por nome e implementar um modal de pesagem/fração (kg).
// ==========================================
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, addSale, Product } from '../database/db';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface CartItem extends Product {
  cartQuantity: number;
}

export default function SalesScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  
  // Camera & Scanner State
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);

  // Edit Quantity State (Pesagem / Inserção manual)
  const [editItem, setEditItem] = useState<CartItem | null>(null);
  const [customQty, setCustomQty] = useState('');

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity + quantity > product.quantity) {
          Alert.alert('Estoque Insuficiente', `Há apenas ${product.quantity} disponíveis.`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + quantity } : item);
      }
      if (product.quantity < quantity) {
        Alert.alert('Sem Estoque', 'A quantidade solicitada não está disponível no estoque.');
        return prev;
      }
      return [...prev, { ...product, cartQuantity: quantity }];
    });
  };

  // Called manually on search button or Enter press
  const handleManualSearch = () => {
    Keyboard.dismiss();
    const query = search.trim().toLowerCase();
    if (!query) return;

    // Direct Barcode Hit
    const barcodeHit = products.find(p => p.barcode === query);
    if (barcodeHit) {
      addToCart(barcodeHit, 1);
      Alert.alert('Item Adicionado!', `Código lido: ${barcodeHit.name}`);
      setSearch('');
      return;
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannerVisible(false);
    const found = products.find(p => p.barcode === data);
    if (found) {
      addToCart(found, 1);
      Alert.alert('Produto Escaneado', `${found.name} foi adicionado ao carrinho.`);
    } else {
      Alert.alert('Produto Desconhecido', `Não foi possível encontrar nenhum produto com o código: ${data}. Cadastre-o no estoque.`);
    }
  };

  // Função para abrir o leitor de código de barras físico usando a lente da câmera do celular
  const openScanner = async () => {
    if (!permission) {
      // Permission not loaded yet
      return;
    }
    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permissão Negada', 'O aplicativo Venda Fácil precisa usar a câmera do dispositivo para ler códigos de barra.');
        return;
      }
    }
    setScannerVisible(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const openQuantityEditor = (item: CartItem) => {
    setEditItem(item);
    setCustomQty(item.cartQuantity.toString());
  };

  const saveCustomQuantity = () => {
    if (!editItem) return;
    const qty = parseFloat(customQty.replace(',', '.'));
    
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Valor Inválido', 'Insira um peso ou quantidade válida.');
      return;
    }
    if (qty > editItem.quantity) {
      Alert.alert('Estoque Insuficiente', `O estoque deste item é de apenas ${editItem.quantity}.`);
      return;
    }
    setCart(prev => prev.map(item => item.id === editItem.id ? { ...item, cartQuantity: qty } : item));
    setEditItem(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  // Lógica principal do pagamento: Pega o valor somado, grava no banco de dados
  // pelo 'addSale' e zera a lista do cupom pra próxima venda!
  const handleCheckout = () => {
    if (cart.length === 0) return;
    Alert.alert(
      'Pagamento do Caixa',
      `O valor total da compra é R$ ${cartTotal.toFixed(2)}. Finalizar transação?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Receber (Dinheiro/Cartão/Pix)', 
          onPress: async () => {
            const saleItems = cart.map(c => ({ id: c.id, quantity: c.cartQuantity }));
            await addSale(cartTotal, saleItems);
            Alert.alert('Venda Concluída', 'Transação registrada no sistema com sucesso!');
            setCart([]);
            loadProducts();
          } 
        }
      ]
    );
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.barcode && p.barcode.includes(search))
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      
      {/* Search and Action Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" style={{marginLeft: 10}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome ou Bip código..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleManualSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={{paddingHorizontal: 8}}>
              <Ionicons name="close-circle" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={openScanner}>
          <Ionicons name="barcode-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainLayout}>
        {/* CATALOG / SEARCH RESULTS */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Consulta Rápida</Text>
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item, 1)}>
                <View style={{flex: 1}}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
                  {item.barcode && <Text style={styles.barcodeText}>Cód: {item.barcode}</Text>}
                </View>
                <View style={styles.badgeInfo}>
                  <Text style={styles.stockText}>Estoque: {item.quantity}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum item localizado.</Text>}
          />
        </View>

        {/* CART / REGISTRY TAPE */}
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Ionicons name="cart-outline" size={24} color="#333" />
            <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>Cupom / PDV</Text>
          </View>
          
          <FlatList
            data={cart}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={{flex: 1}}>
                  <Text style={styles.cartItemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>
                    {item.cartQuantity} x R$ {item.price.toFixed(2)}  =  <Text style={{fontWeight: 'bold'}}>R$ {(item.cartQuantity * item.price).toFixed(2)}</Text>
                  </Text>
                </View>

                <View style={styles.cartActions}>
                  <TouchableOpacity style={styles.editAction} onPress={() => openQuantityEditor(item)}>
                    <Text style={styles.editActionText}>Pesar / Múltiplo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{marginLeft: 12}}>
                    <Ionicons name="trash-outline" size={22} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Caixa Livre...</Text>}
          />

          <View style={styles.checkoutFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Valor Total:</Text>
              <Text style={styles.totalValue}>R$ {cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutBtn, cart.length === 0 && {backgroundColor: '#ccc'}]} 
              onPress={handleCheckout}
              disabled={cart.length === 0}
            >
              <Ionicons name="wallet" size={24} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.checkoutBtnText}>Receber Pagamento</Text>
            </TouchableOpacity>
            
            {cart.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setCart([])}>
                <Text style={styles.clearBtnText}>Cancelar Compra Atual</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* MODAL: Editor de Peso / Quantidade Manual */}
      <Modal visible={!!editItem} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.qtyModal}>
            <Text style={styles.modalTitle}>Quantidade ou Peso (Kg)</Text>
            <Text style={{marginBottom: 15, textAlign: 'center', color: '#666'}}>{editItem?.name}</Text>
            
            <TextInput
              style={styles.qtyInput}
              value={customQty}
              onChangeText={setCustomQty}
              keyboardType="numeric"
            />
            
            <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'space-between'}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#e0e0e0'}]} onPress={() => setEditItem(null)}>
                <Text style={{color: '#333', fontWeight: 'bold'}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#2f95dc'}]} onPress={saveCustomQuantity}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: Câmera / Scanner Nativo */}
      <Modal visible={scannerVisible} transparent={false} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView 
            style={styles.camera} 
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'] }}
            onBarcodeScanned={scannerVisible ? handleBarcodeScanned : undefined}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scanTarget} />
              <Text style={styles.scanInstruction}>Aponte para o código de barras ou QR Code</Text>
              
              <TouchableOpacity style={styles.closeScanBtn} onPress={() => setScannerVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
                <Text style={{color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: 'bold'}}>Fechar Leitor</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  topBar: { flexDirection: 'row', padding: 15, backgroundColor: '#2f95dc', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  searchBox: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, height: 48, alignItems: 'center', marginRight: 15, elevation: 2 },
  searchInput: { flex: 1, height: '100%', paddingHorizontal: 10, fontSize: 16 },
  scanBtn: { backgroundColor: '#1565c0', padding: 10, paddingHorizontal: 14, borderRadius: 8, elevation: 2 },
  mainLayout: { flex: 1, flexDirection: 'column' },
  productsSection: { flex: 1, padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#444' },
  productCard: { backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 8, elevation: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  productPrice: { fontSize: 14, color: '#f57c00', marginTop: 4, fontWeight: '800' },
  barcodeText: { fontSize: 12, color: '#888', marginTop: 2 },
  badgeInfo: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  stockText: { color: '#1565c0', fontSize: 12, fontWeight: 'bold' },
  cartSection: { flex: 1.5, backgroundColor: '#fff', paddingTop: 10, display: 'flex' },
  cartHeader: { paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  cartItem: { padding: 15, borderBottomWidth: 1, borderColor: '#f5f5f5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cartItemName: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  cartItemPrice: { fontSize: 14, color: '#666' },
  cartActions: { flexDirection: 'row', alignItems: 'center' },
  editAction: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 5, borderWidth: 1, borderColor: '#c8e6c9' },
  editActionText: { color: '#2e7d32', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 20, fontStyle: 'italic' },
  checkoutFooter: { padding: 15, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  totalText: { fontSize: 18, fontWeight: '600', color: '#555' },
  totalValue: { fontSize: 28, fontWeight: '900', color: '#2e7d32' },
  checkoutBtn: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', elevation: 2 },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  clearBtn: { padding: 15, alignItems: 'center', marginTop: 5 },
  clearBtnText: { color: '#d32f2f', fontSize: 15, fontWeight: 'bold', textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  qtyModal: { width: 320, backgroundColor: '#fff', borderRadius: 15, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#222' },
  qtyInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, fontSize: 24, textAlign: 'center', padding: 15, backgroundColor: '#f9f9f9', color: '#000' },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  scannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanTarget: { width: 280, height: 280, borderWidth: 3, borderColor: '#00e676', backgroundColor: 'transparent', borderRadius: 20 },
  scanInstruction: { color: '#fff', fontSize: 16, marginTop: 20, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 20 },
  closeScanBtn: { position: 'absolute', bottom: 60, flexDirection: 'row', backgroundColor: '#d32f2f', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, alignItems: 'center', elevation: 5 }
});
