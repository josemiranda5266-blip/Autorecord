import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile } from '../types';

const COLLECTION_NAME = 'users';

export const userService = {
  /**
    * Sincroniza o crea el perfil del usuario autenticado en users/{uid} en Firestore.
    * Utiliza estrictamente auth.currentUser.uid como clave de documento.
    */
  async syncUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!db) return null;

    const currentUid = auth?.currentUser?.uid;
    if (!currentUid) {
      throw new Error('Usuario no autenticado en Firebase Auth.');
    }

    try {
      const userRef = doc(db, COLLECTION_NAME, currentUid);
      const userSnap = await getDoc(userRef);

      const email = auth.currentUser?.email || profileData.email || '';
      const displayName =
        auth.currentUser?.displayName ||
        profileData.displayName ||
        email.split('@')[0] ||
        'Usuario';
      const plan = profileData.plan || 'free';
      const now = new Date().toISOString();

      if (!userSnap.exists()) {
        const newUserProfile: UserProfile = {
          id: currentUid,
          email,
          displayName,
          plan,
          createdAt: now,
        };

        await setDoc(userRef, {
          uid: currentUid,
          email,
          displayName,
          plan,
          createdAt: now,
          updatedAt: now,
        });

        return newUserProfile;
      } else {
        const existingData = userSnap.data();
        const updatedProfile: UserProfile = {
          id: currentUid,
          email: existingData.email || email,
          displayName: existingData.displayName || displayName,
          plan: existingData.plan || plan,
          createdAt: existingData.createdAt || now,
        };

        await setDoc(
          userRef,
          {
            uid: currentUid,
            email: updatedProfile.email,
            displayName: updatedProfile.displayName,
            plan: updatedProfile.plan,
            updatedAt: now,
          },
          { merge: true }
        );

        return updatedProfile;
      }
    } catch (error) {
      console.error('Error al sincronizar perfil de usuario en Firestore:', error);
      return null;
    }
  },

  async getUserProfile(uid?: string): Promise<UserProfile | null> {
    if (!db) return null;
    const targetUid = auth?.currentUser?.uid || uid;
    if (!targetUid) return null;
    try {
      const userRef = doc(db, COLLECTION_NAME, targetUid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: targetUid,
          email: data.email || '',
          displayName: data.displayName || '',
          plan: data.plan || 'free',
          createdAt: data.createdAt || new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      return null;
    }
  },
};
