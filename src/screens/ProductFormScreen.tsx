import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addProduct, updateProduct, Product } from '../database/db';
import { Ionicons } from '@expo/vector-icons';

export default function ProductFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const productToEdit: Product | undefined = route.params?.product;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    if (productToEdit) {
      navigation.setOptions({ title: 'Editar Produto' });
      setName(productToEdit.name);
      setPrice(productToEdit.price.toString());
      setQuantity(productToEdit.quantity.toString());
      setBarcode(productToEdit.barcode || '');
    } else {
      navigation.setOptions({ title: 'Novo Produto' });
    }
  }, [productToEdit, navigation]);

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !quantity.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    const priceNum = parseFloat(price.replace(',', '.'));
    const qtyNum = parseInt(quantity, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Erro', 'Preço inválido.');
      return;
    }

    if (isNaN(qtyNum) || qtyNum < 0) {
      Alert.alert('Erro', 'Quantidade inválida.');
      return;
    }

    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, name, priceNum, qtyNum, barcode);
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      } else {
        await addProduct(name, priceNum, qtyNum, barcode);
        Alert.alert('Sucesso', 'Produto criado com sucesso!');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Houve um problema ao salvar o produto.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.headerBox}>
          <Ionicons name="cube" size={40} color="#2f95dc" />
          <Text style={styles.headerText}>
            {productToEdit ? 'Atualize as informações do seu produto no estoque.' : 'Preencha os dados básicos do seu novo produto.'}
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Produto</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="text-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Cerveja Artesanal" 
              value={name} 
              onChangeText={setName} 
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preço Unitário (R$)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="pricetag-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 12.50" 
              value={price} 
              onChangeText={setPrice} 
              keyboardType="numeric" 
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantidade em Estoque</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="layers-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 50" 
              value={quantity} 
              onChangeText={setQuantity} 
              keyboardType="number-pad" 
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Código de Barras (Opcional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="barcode-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 789102030" 
              value={barcode} 
              onChangeText={setBarcode} 
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>{productToEdit ? 'Salvar Alterações' : 'Cadastrar Produto'}</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  scroll: { padding: 20 },
  headerBox: {
    alignItems: 'center', marginBottom: 30, padding: 20, 
    backgroundColor: '#e3f2fd', borderRadius: 15
  },
  headerText: {
    textAlign: 'center', color: '#1565c0', marginTop: 10, fontSize: 16
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 15, height: 55,
    elevation: 2
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  saveBtn: {
    backgroundColor: '#2f95dc', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 16, borderRadius: 12, marginTop: 10, elevation: 3
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
