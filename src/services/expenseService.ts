import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Expense } from '../types';

const COLLECTION_NAME = 'expenses';

export const expenseService = {
  async getExpenses(userId: string): Promise<Expense[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Expense[];
    } catch (error) {
      console.error('Error fetching expenses from Firestore:', error);
      throw new Error('No se pudieron obtener los gastos.');
    }
  },

  subscribeExpenses(userId: string, onUpdate: (items: Expense[]) => void) {
    if (!db) {
      onUpdate([]);
      return () => {};
    }
    const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Expense[];
        onUpdate(items);
      },
      (error) => {
        console.error('Error in expenses snapshot listener:', error);
      }
    );
  },

  async addExpense(expense: Expense): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, expense.id);
      await setDoc(docRef, expense);
    } catch (error) {
      console.error('Error adding expense to Firestore:', error);
      throw new Error('No se pudo registrar el gasto.');
    }
  },

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<void> {
    if (!db) return;
    try {
      const { id, userId, createdAt, ...sanitizedUpdates } = updates as Expense;
      const docRef = doc(db, COLLECTION_NAME, expenseId);
      await updateDoc(docRef, sanitizedUpdates);
    } catch (error) {
      console.error('Error updating expense in Firestore:', error);
      throw new Error('No se pudo actualizar el gasto.');
    }
  },

  async deleteExpense(expenseId: string): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, expenseId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting expense from Firestore:', error);
      throw new Error('No se pudo eliminar el gasto.');
    }
  },

  async deleteByVehicle(userId: string, vehicleId: string): Promise<void> {
    if (!db) return;
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('vehicleId', '==', vehicleId)
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting vehicle expenses:', error);
    }
  },
};
