import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Vehicle } from '../types';

const COLLECTION_NAME = 'vehicles';

export const vehicleService = {
  async getVehicles(userId?: string): Promise<Vehicle[]> {
    if (!db) return [];
    const uid = auth?.currentUser?.uid || userId;
    if (!uid) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', uid));
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

  subscribeVehicles(
    param1: string | ((vehicles: Vehicle[]) => void),
    param2?: (vehicles: Vehicle[]) => void
  ) {
    let onUpdate: (vehicles: Vehicle[]) => void;
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
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, vehicle.id);
      await setDoc(docRef, { ...vehicle, userId: uid });
    } catch (error) {
      console.error('Error adding vehicle to Firestore:', error);
      throw new Error('No se pudo guardar el vehículo. Verificá tu conexión e intentá nuevamente.');
    }
  },

  async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
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

  async deleteVehicle(vehicleId: string): Promise<void> {
    if (!db) return;

    // Obtener UID directamente del usuario autenticado en Firebase Auth
    const authenticatedUid = auth?.currentUser?.uid;
    if (!authenticatedUid) {
      throw new Error('Usuario no autenticado.');
    }

    try {
      // Verificar que el vehículo exista y pertenezca al usuario autenticado
      const vehDocRef = doc(db, COLLECTION_NAME, vehicleId);
      const vehSnap = await getDoc(vehDocRef);

      if (vehSnap.exists() && vehSnap.data().userId !== authenticatedUid) {
        throw new Error('Acceso no autorizado: El vehículo pertenece a otro usuario.');
      }

      // Proceso de eliminación en cascada utilizando lotes atómicos (máximo 400 escrituras por batch)
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

      // 1. Eliminar mantenimientos relacionados del usuario autenticado
      const maintQ = query(
        collection(db, 'maintenance'),
        where('userId', '==', authenticatedUid),
        where('vehicleId', '==', vehicleId)
      );
      const maintSnap = await getDocs(maintQ);
      for (const dSnap of maintSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 2. Eliminar gastos relacionados del usuario autenticado
      const expQ = query(
        collection(db, 'expenses'),
        where('userId', '==', authenticatedUid),
        where('vehicleId', '==', vehicleId)
      );
      const expSnap = await getDocs(expQ);
      for (const dSnap of expSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 3. Eliminar documentos relacionados del usuario autenticado
      const docQ = query(
        collection(db, 'documents'),
        where('userId', '==', authenticatedUid),
        where('vehicleId', '==', vehicleId)
      );
      const docSnap = await getDocs(docQ);
      for (const dSnap of docSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 4. Eliminar registros de kilometraje relacionados del usuario autenticado
      const mileQ = query(
        collection(db, 'mileage'),
        where('userId', '==', authenticatedUid),
        where('vehicleId', '==', vehicleId)
      );
      const mileSnap = await getDocs(mileQ);
      for (const dSnap of mileSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 5. Eliminar recordatorios relacionados del usuario autenticado
      const remQ = query(
        collection(db, 'reminders'),
        where('userId', '==', authenticatedUid),
        where('vehicleId', '==', vehicleId)
      );
      const remSnap = await getDocs(remQ);
      for (const dSnap of remSnap.docs) {
        currentBatch.delete(dSnap.ref);
        batchOpCount++;
        await commitIfNeeded();
      }

      // 6. Eliminar el documento del vehículo propiamente dicho
      currentBatch.delete(vehDocRef);
      batchOpCount++;

      // Confirmar cualquier operación pendiente en el batch final
      await commitIfNeeded(true);
    } catch (error) {
      console.error('Error al eliminar vehículo y registros vinculados en Firestore:', error);
      throw error instanceof Error
        ? error
        : new Error('No se pudo eliminar el vehículo y sus registros asociados.');
    }
  },
};

