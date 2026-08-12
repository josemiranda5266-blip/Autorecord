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
import { DocumentRecord } from '../types';

const COLLECTION_NAME = 'documents';

export const documentService = {
  async getDocuments(userId: string): Promise<DocumentRecord[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as DocumentRecord[];
    } catch (error) {
      console.error('Error fetching documents from Firestore:', error);
      throw new Error('No se pudieron obtener los documentos.');
    }
  },

  subscribeDocuments(userId: string, onUpdate: (items: DocumentRecord[]) => void) {
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
        })) as DocumentRecord[];
        onUpdate(items);
      },
      (error) => {
        console.error('Error in documents snapshot listener:', error);
      }
    );
  },

  async addDocument(documentRecord: DocumentRecord): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, documentRecord.id);
      await setDoc(docRef, documentRecord);
    } catch (error) {
      console.error('Error adding document to Firestore:', error);
      throw new Error('No se pudo guardar el documento.');
    }
  },

  async updateDocument(docId: string, updates: Partial<DocumentRecord>): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, docId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating document in Firestore:', error);
      throw new Error('No se pudo actualizar el documento.');
    }
  },

  async deleteDocument(docId: string): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document from Firestore:', error);
      throw new Error('No se pudo eliminar el documento.');
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
      console.error('Error deleting vehicle documents:', error);
    }
  },
};
