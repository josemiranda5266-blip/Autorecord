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
  writeBatch,
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
      const { id, userId, createdAt, ...sanitizedUpdates } = updates as Vehicle;
      const docRef = doc(db, COLLECTION_NAME, vehicleId);
      await updateDoc(docRef, {
        ...sanitizedUpdates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating vehicle in Firestore:', error);
      throw new Error('No se pudo actualizar el vehículo.');
    }
  },

  async deleteVehicle(vehicleId: string, userId: string): Promise<void> {
    if (!db) return;
    try {
      const batchLimit = 400;
      let currentBatch = writeBatch(db);
      let batchOpCount = 0;

      const commitIfNeeded = async (force = false) => {
        if (batchOpCount > 0 && (batchOpCount >= batchLimit || force)) {
          await currentBatch.commit();
          currentBatch = writeBatch(db);
          batchOpCount = 0;
        }
      };

      // 1. Queue deletion of related maintenance items
      const maintQ = query(
        collection(db, 'maintenance'),
        where('userId', '==', userId),
        where('vehicleId', '==', vehicleId)
      );
      const maintSnap = await getDocs(maintQ);
      for (const dSnap of maintSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 2. Queue deletion of related expenses
      const expQ = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        where('vehicleId', '==', vehicleId)
      );
      const expSnap = await getDocs(expQ);
      for (const dSnap of expSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 3. Queue deletion of related documents
      const docQ = query(
        collection(db, 'documents'),
        where('userId', '==', userId),
        where('vehicleId', '==', vehicleId)
      );
      const docSnap = await getDocs(docQ);
      for (const dSnap of docSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 4. Queue deletion of related mileage logs
      const mileQ = query(
        collection(db, 'mileage'),
        where('userId', '==', userId),
        where('vehicleId', '==', vehicleId)
      );
      const mileSnap = await getDocs(mileQ);
      for (const dSnap of mileSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 5. Delete the vehicle document itself
      const vehDocRef = doc(db, COLLECTION_NAME, vehicleId);
      currentBatch.delete(vehDocRef);
      batchOpCount++;

      await commitIfNeeded(true);
    } catch (error) {
      console.error('Error deleting vehicle and related items from Firestore:', error);
      throw new Error('No se pudo eliminar el vehículo y sus registros asociados.');
    }
  },
};

