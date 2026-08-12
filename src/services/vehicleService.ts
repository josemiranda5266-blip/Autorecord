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
import { Vehicle } from '../types';

const COLLECTION_NAME = 'vehicles';

export const vehicleService = {
  async getVehicles(userId: string): Promise<Vehicle[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Vehicle[];
    } catch (error) {
      console.error('Error fetching vehicles from Firestore:', error);
      throw new Error('No se pudieron obtener los vehículos desde la base de datos.');
    }
  },

  subscribeVehicles(userId: string, onUpdate: (vehicles: Vehicle[]) => void) {
    if (!db) {
      onUpdate([]);
      return () => {};
    }
    const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const vehicles = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Vehicle[];
        onUpdate(vehicles);
      },
      (error) => {
        console.error('Error in vehicles snapshot listener:', error);
      }
    );
  },

  async addVehicle(vehicle: Vehicle): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, vehicle.id);
      await setDoc(docRef, vehicle);
    } catch (error) {
      console.error('Error adding vehicle to Firestore:', error);
      throw new Error('No se pudo guardar el vehículo. Verificá tu conexión e intentá nuevamente.');
    }
  },

  async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, vehicleId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating vehicle in Firestore:', error);
      throw new Error('No se pudo actualizar el vehículo.');
    }
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, vehicleId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting vehicle from Firestore:', error);
      throw new Error('No se pudo eliminar el vehículo.');
    }
  },
};
