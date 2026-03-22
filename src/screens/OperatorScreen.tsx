import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onLogin: (name: string, initialCash: number) => void;
}

export default function OperatorScreen({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [initialCash, setInitialCash] = useState('');

  const handleEnter = () => {
    if (name.trim().length < 2) {
      Alert.alert('Bem-vindo!', 'Por favor, insira o seu nome de usuário.');
      return;
    }
    if (password !== '1234') {
      Alert.alert('Acesso Negado', 'Senha incorreta. (Dica de teste: 1234)');
      return;
    }
    
    const cashValue = parseFloat(initialCash.replace(',', '.'));
    if (isNaN(cashValue) || cashValue < 0) {
      Alert.alert('Ação Inválida', 'Informe um valor inicial em caixa (troco) válido.');
      return;
    }

    onLogin(name.trim(), cashValue);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Ionicons name="pricetags" size={60} color="#2f95dc" />
        </View>
        <Text style={styles.appName}>Venda Fácil</Text>
        <Text style={styles.subtitle}>Gestão de Vendas e Estoque</Text>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.label}>Abertura de Caixa</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nome do Operador"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha (Ex: 1234)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={24} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Fundo de Troco Inicial (R$)"
            value={initialCash}
            onChangeText={setInitialCash}
            keyboardType="numeric"
            returnKeyType="go"
            onSubmitEditing={handleEnter}
          />
        </View>
        
        <TouchableOpacity style={styles.btn} onPress={handleEnter}>
          <Text style={styles.btnText}>Abrir Caixa</Text>
          <Ionicons name="log-in-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f95dc',
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    marginTop: 5,
  },
  formSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
    backgroundColor: '#fbfbfb',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  btn: {
    backgroundColor: '#2f95dc',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 55,
    borderRadius: 12,
    marginTop: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  }
});

