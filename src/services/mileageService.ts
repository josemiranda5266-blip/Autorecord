import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { MileageLog } from '../types';

const COLLECTION_NAME = 'mileage';

export const mileageService = {
  async getMileageLogs(userId?: string): Promise<MileageLog[]> {
    if (!db) return [];
    const uid = auth?.currentUser?.uid || userId;
    if (!uid) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MileageLog[];
    } catch (error) {
      console.error('Error fetching mileage logs from Firestore:', error);
      throw new Error('No se pudieron obtener las lecturas de kilometraje.');
    }
  },

  subscribeMileageLogs(
    param1: string | ((items: MileageLog[]) => void),
    param2?: (items: MileageLog[]) => void
  ) {
    let onUpdate: (items: MileageLog[]) => void;
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
        })) as MileageLog[];
        onUpdate(items);
      },
      (error) => {
        console.error('Error in mileage snapshot listener:', error);
      }
    );
  },

  async addMileageLog(log: MileageLog): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, log.id);
      await setDoc(docRef, { ...log, userId: uid });
    } catch (error) {
      console.error('Error adding mileage log to Firestore:', error);
      throw new Error('No se pudo guardar la lectura de kilometraje.');
    }
  },
};
