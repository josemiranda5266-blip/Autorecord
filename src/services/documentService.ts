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
import { DocumentRecord } from '../types';

const COLLECTION_NAME = 'documents';

export const documentService = {
  async getDocuments(): Promise<DocumentRecord[]> {
    if (!db) return [];
    const uid = auth?.currentUser?.uid;
    if (!uid) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', uid));
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

  subscribeDocuments(onUpdate: (items: DocumentRecord[]) => void) {
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
        })) as DocumentRecord[];
        onUpdate(items);
      },
      (error) => {
        console.error('Error in documents snapshot listener:', error);
      }
    );
  },

  async addDocument(documentRecord: Omit<DocumentRecord, 'userId'> & { id: string; userId?: string }): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, documentRecord.id);
      await setDoc(docRef, { ...documentRecord, userId: uid });
    } catch (error) {
      console.error('Error adding document to Firestore:', error);
      throw new Error('No se pudo guardar el documento.');
    }
  },

  async updateDocument(docId: string, updates: Partial<DocumentRecord>): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const { id, userId, createdAt, ...sanitizedUpdates } = updates as DocumentRecord;
      const docRef = doc(db, COLLECTION_NAME, docId);
      await updateDoc(docRef, sanitizedUpdates);
    } catch (error) {
      console.error('Error updating document in Firestore:', error);
      throw new Error('No se pudo actualizar el documento.');
    }
  },

  async deleteDocument(docId: string): Promise<void> {
    if (!db) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error('Usuario no autenticado.');
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document from Firestore:', error);
      throw new Error('No se pudo eliminar el documento.');
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
      console.error('Error deleting vehicle documents:', error);
    }
  },
};
