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
import { MaintenanceItem } from '../types';

const COLLECTION_NAME = 'maintenance';

export const maintenanceService = {
  async getMaintenances(userId: string): Promise<MaintenanceItem[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MaintenanceItem[];
    } catch (error) {
      console.error('Error fetching maintenance from Firestore:', error);
      throw new Error('No se pudieron obtener las tareas de mantenimiento.');
    }
  },

  subscribeMaintenances(userId: string, onUpdate: (items: MaintenanceItem[]) => void) {
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
        })) as MaintenanceItem[];
        onUpdate(items);
      },
      (error) => {
        console.error('Error in maintenance snapshot listener:', error);
      }
    );
  },

  async addMaintenance(item: MaintenanceItem): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      await setDoc(docRef, item);
    } catch (error) {
      console.error('Error adding maintenance to Firestore:', error);
      throw new Error('No se pudo registrar el mantenimiento.');
    }
  },

  async updateMaintenance(itemId: string, updates: Partial<MaintenanceItem>): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating maintenance in Firestore:', error);
      throw new Error('No se pudo actualizar el mantenimiento.');
    }
  },

  async deleteMaintenance(itemId: string): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, itemId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting maintenance from Firestore:', error);
      throw new Error('No se pudo eliminar el registro de mantenimiento.');
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
      console.error('Error deleting vehicle maintenances:', error);
    }
  },
};
