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
import { MaintenanceItem } from '../types';

const COLLECTION_NAME = 'maintenance';

export const maintenanceService = {
  async getMaintenances(userId?: string): Promise<MaintenanceItem[]> {
    if (!db) return [];
    const uid = auth?.currentUser?.uid || userId;
    if (!uid) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', uid));
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

  subscribeMaintenances(
    param1: string | ((items: MaintenanceItem[]) => void),
    param2?: (items: MaintenanceItem[]) => void
  ) {
    let onUpdate: (items: MaintenanceItem[]) => void;
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
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      await setDoc(docRef, { ...item, userId: uid });
    } catch (error) {
      console.error('Error adding maintenance to Firestore:', error);
      throw new Error('No se pudo registrar el mantenimiento.');
    }
  },

  async updateMaintenance(itemId: string, updates: Partial<MaintenanceItem>): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const { id, userId, createdAt, ...sanitizedUpdates } = updates as MaintenanceItem;
      const docRef = doc(db, COLLECTION_NAME, itemId);
      await updateDoc(docRef, sanitizedUpdates);
    } catch (error) {
      console.error('Error updating maintenance in Firestore:', error);
      throw new Error('No se pudo actualizar el mantenimiento.');
    }
  },

  async deleteMaintenance(itemId: string): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, itemId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting maintenance from Firestore:', error);
      throw new Error('No se pudo eliminar el registro de mantenimiento.');
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
      console.error('Error deleting vehicle maintenances:', error);
    }
  },
};
