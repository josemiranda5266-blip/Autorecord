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
import { Reminder } from '../types';

const COLLECTION_NAME = 'reminders';

export const reminderService = {
  async getReminders(): Promise<Reminder[]> {
    if (!db) return [];
    const uid = auth?.currentUser?.uid;
    if (!uid) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Reminder[];
    } catch (error) {
      console.error('Error fetching reminders from Firestore:', error);
      throw new Error('No se pudieron obtener los recordatorios.');
    }
  },

  subscribeReminders(onUpdate: (reminders: Reminder[]) => void) {
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
        })) as Reminder[];
        onUpdate(items);
      },
      (error) => {
        console.error('Error in reminders snapshot listener:', error);
      }
    );
  },

  async addReminder(reminder: Reminder): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, reminder.id);
      await setDoc(docRef, { ...reminder, userId: uid });
    } catch (error) {
      console.error('Error adding reminder to Firestore:', error);
      throw new Error('No se pudo guardar el recordatorio.');
    }
  },

  async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const { id, userId, createdAt, ...sanitizedUpdates } = updates as Reminder;
      const docRef = doc(db, COLLECTION_NAME, reminderId);
      await updateDoc(docRef, sanitizedUpdates);
    } catch (error) {
      console.error('Error updating reminder in Firestore:', error);
      throw new Error('No se pudo actualizar el recordatorio.');
    }
  },

  async deleteReminder(reminderId: string): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, reminderId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting reminder from Firestore:', error);
      throw new Error('No se pudo eliminar el recordatorio.');
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
      console.error('Error deleting vehicle reminders:', error);
    }
  },
};
