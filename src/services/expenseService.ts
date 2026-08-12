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
import { db, auth } from '../lib/firebase';
import { Expense } from '../types';

const COLLECTION_NAME = 'expenses';

export const expenseService = {
  async getExpenses(userId?: string): Promise<Expense[]> {
    if (!db) return [];
    const uid = auth?.currentUser?.uid || userId;
    if (!uid) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', uid));
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

  subscribeExpenses(
    param1: string | ((items: Expense[]) => void),
    param2?: (items: Expense[]) => void
  ) {
    let onUpdate: (items: Expense[]) => void;
    if (typeof param1 === 'function') {
      onUpdate = param1;
    } else if (typeof param2 === 'function') {
      onUpdate = param2;
    } else {
      return () => {};
    }

    if (!db) {
      onUpdate([]);
      return () => {};
    }
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      onUpdate([]);
      return () => {};
    }
    const q = query(collection(db, COLLECTION_NAME), where('userId', '==', uid));
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
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, expense.id);
      await setDoc(docRef, { ...expense, userId: uid });
    } catch (error) {
      console.error('Error adding expense to Firestore:', error);
      throw new Error('No se pudo registrar el gasto.');
    }
  },

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
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
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, expenseId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting expense from Firestore:', error);
      throw new Error('No se pudo eliminar el gasto.');
    }
  },

  async deleteByVehicle(vehicleId: string): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', uid),
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
