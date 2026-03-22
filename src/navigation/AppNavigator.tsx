// ==========================================
// ARQUITETURA DE ROTAS E TABS
// Este arquivo é o pilar que monta toda as telas do App!
// Eu decidi usar as bibliotecas nativas de navegação do React (BottomTabs e Stack)
// para dar uma aparência e performance premium de aplicativo compilado.
// Também coloquei aqui a trava de "Login" do Operador. Se não tiver operado, o PDV não abre.
// ==========================================
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import SalesScreen from '../screens/SalesScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import OperatorScreen from '../screens/OperatorScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator({ route }: any) {
  const operatorName = route.params?.operator || 'Operador';
  const initialCash = route.params?.initialCash || 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Vendas') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Estoque') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else {
            iconName = 'list';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2f95dc',
        },
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="pricetags" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Venda Fácil</Text>
          </View>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} initialParams={{ operator: operatorName, initialCash }} />
      <Tab.Screen name="Vendas" component={SalesScreen} />
      <Tab.Screen name="Estoque" component={InventoryScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [session, setSession] = useState<{name: string, initialCash: number} | null>(null);

  if (!session) {
    return <OperatorScreen onLogin={(name, initialCash) => setSession({ name, initialCash })} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          initialParams={{ operator: session.name, initialCash: session.initialCash }}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProductForm" 
          component={ProductFormScreen} 
          options={{ 
            title: 'Produto',
            headerStyle: { backgroundColor: '#2f95dc' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' } 
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



