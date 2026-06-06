'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  // login/register methods are typically handled directly by Firebase Auth via components, 
  // but we keep the context for global state.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let userData: User;

          if (userDocSnap.exists()) {
            userData = userDocSnap.data() as User;
            // Ensure ID matches
            userData.id = firebaseUser.uid;
            
            // Enforce hardcoded admin email
            if (firebaseUser.email === 'uwiringiyimanamoise700@gmail.com') {
              userData.role = 'admin';
            } else {
              userData.role = 'user';
            }
          } else {
            // If user doc doesn't exist (e.g. just signed up via Google), create a default one
            userData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email || '',
              role: (firebaseUser.email === 'uwiringiyimanamoise700@gmail.com') ? 'admin' : 'user',
              created_at: new Date().toISOString()
            };
            if (firebaseUser.photoURL) {
              userData.avatar_url = firebaseUser.photoURL;
            }
            await setDoc(userDocRef, userData);
          }

          const freshToken = await firebaseUser.getIdToken();
          setToken(freshToken);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      // state clears via onAuthStateChanged listener
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
