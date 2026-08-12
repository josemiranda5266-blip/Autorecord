import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MileageLog } from '../types';

const COLLECTION_NAME = 'mileage';

export const mileageService = {
  async getMileageLogs(userId: string): Promise<MileageLog[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
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

  subscribeMileageLogs(userId: string, onUpdate: (items: MileageLog[]) => void) {
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
    try {
      const docRef = doc(db, COLLECTION_NAME, log.id);
      await setDoc(docRef, log);
    } catch (error) {
      console.error('Error adding mileage log to Firestore:', error);
      throw new Error('No se pudo guardar la lectura de kilometraje.');
    }
  },
};
