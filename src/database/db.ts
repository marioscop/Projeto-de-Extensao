// ==========================================
// ARQUIVO: db.ts
// PROJETO DE EXTENSÃO - VENDA FÁCIL
// Aqui eu estruturei todo o banco de dados do aplicativo usando SQLite nativo.
// Minha escolha técnica pelo SQLite foi para garantir que o pequeno comércio local
// funcione 100% offline (sem precisar de internet na hora de passar um produto).
// ==========================================
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface Product { id: number; name: string; price: number; quantity: number; barcode?: string; }
export interface Sale { id: number; total: number; date: string; }

// === MOCKS FOR WEB PREVIEW ===
let mockProducts: Product[] = [
  { id: 1, name: 'Refrigerante Lata', price: 5.50, quantity: 20, barcode: '789101010' },
  { id: 2, name: 'Salgado Assado', price: 6.00, quantity: 4, barcode: '789202020' } // Low stock
];
let mockSales: Sale[] = [];
let nextId = 3;

// === NATIVE SQLITE ===
// Função para abrir ou criar o arquivo de banco de dados no aparelho do lojista
export async function getDb() {
  if (Platform.OS === 'web') return null;
  return await SQLite.openDatabaseAsync('estacio.db');
}

// Inicializa o banco (Roda assim que o app carrega)
// Aqui eu criei a tabela de produtos já com a coluna 'barcode' para leitura pela câmera!
export async function initDb() {
  if (Platform.OS === 'web') return; // Mock is ready
  const db = await getDb();
  if (!db) return;
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, quantity REAL NOT NULL, barcode TEXT);
    CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, total REAL NOT NULL, date TEXT NOT NULL);
  `);
  // Try to add column if table was created in an older version without it
  try { await db.execAsync(`ALTER TABLE products ADD COLUMN barcode TEXT;`); } catch (e) {}
}

export async function getProducts(): Promise<Product[]> {
  if (Platform.OS === 'web') return [...mockProducts];
  const db = await getDb();
  return db ? await db.getAllAsync<Product>('SELECT * FROM products ORDER BY name ASC;') : [];
}

// Função complexa de inserção que criei para o Cadastro do Estoque
export async function addProduct(name: string, price: number, quantity: number, barcode?: string) {
  if (Platform.OS === 'web') {
    mockProducts.push({ id: nextId++, name, price, quantity, barcode });
    return nextId - 1;
  }
  const db = await getDb();
  if (!db) return 0;
  const result = await db.runAsync('INSERT INTO products (name, price, quantity, barcode) VALUES (?, ?, ?, ?)', [name, price, quantity, barcode || null]);
  return result.lastInsertRowId;
}

export async function updateProduct(id: number, name: string, price: number, quantity: number, barcode?: string) {
  if (Platform.OS === 'web') {
    const idx = mockProducts.findIndex(p => p.id === id);
    if (idx !== -1) mockProducts[idx] = { id, name, price, quantity, barcode };
    return;
  }
  const db = await getDb();
  if (db) await db.runAsync('UPDATE products SET name = ?, price = ?, quantity = ?, barcode = ? WHERE id = ?', [name, price, quantity, barcode || null, id]);
}

export async function deleteProduct(id: number) {
  if (Platform.OS === 'web') {
    mockProducts = mockProducts.filter(p => p.id !== id);
    return;
  }
  const db = await getDb();
  if (db) await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
}

// O checkout do PDV: essa função grava o número da venda e já tira os produtos do estoque
export async function addSale(total: number, cartItems: { id: number; quantity: number }[]) {
  if (Platform.OS === 'web') {
    mockSales.push({ id: Date.now(), total, date: new Date().toISOString() });
    cartItems.forEach(item => {
      const prod = mockProducts.find(p => p.id === item.id);
      if (prod) prod.quantity -= item.quantity;
    });
    return;
  }
  const db = await getDb();
  if (!db) return;
  const date = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('INSERT INTO sales (total, date) VALUES (?, ?)', [total, date]);
    for (const item of cartItems) {
      await txn.runAsync('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.id]);
    }
  });
}

export async function getHistory(): Promise<Sale[]> {
  if (Platform.OS === 'web') return [...mockSales];
  const db = await getDb();
  return db ? await db.getAllAsync<Sale>('SELECT * FROM sales ORDER BY date DESC;') : [];
}

export async function getDashboardStats() {
  if (Platform.OS === 'web') {
    const todaySales = mockSales.reduce((acc, s) => acc + s.total, 0);
    const lowStockCount = mockProducts.filter(p => p.quantity < 5).length;
    return { todaySales, lowStockCount };
  }
  const db = await getDb();
  if (!db) return { todaySales: 0, lowStockCount: 0 };
  const todayPrefix = new Date().toISOString().split('T')[0];
  const salesResult = await db.getFirstAsync<{ total_vendas: number }>("SELECT sum(total) as total_vendas FROM sales WHERE date LIKE ?", [`${todayPrefix}%`]);
  const lowStockResult = await db.getFirstAsync<{ low_stock_count: number }>("SELECT count(*) as low_stock_count FROM products WHERE quantity < 5");
  return {
    todaySales: salesResult?.total_vendas || 0,
    lowStockCount: lowStockResult?.low_stock_count || 0
  };
}
