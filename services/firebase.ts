import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCf15J1aznKNnQNUlZS_yUfrYM5BBiwcNc",
  authDomain: "finanza-serendipia.firebaseapp.com",
  projectId: "finanza-serendipia",
  storageBucket: "finanza-serendipia.firebasestorage.app",
  messagingSenderId: "684524164609",
  appId: "1:684524164609:web:8989c8b1d2a1482f3b9200",
  measurementId: "G-S06WSTC1XZ"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
export const db = getFirestore(app);

// Exporta los tipos de Firestore para TypeScript
export type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';

// Funciones de utilidad para trabajar con Firestore
export const fromMillis = (millis: number) => {
  const { Timestamp } = require('firebase/firestore');
  return Timestamp.fromMillis(millis);
};

export const serverTimestamp = () => {
  const { serverTimestamp } = require('firebase/firestore');
  return serverTimestamp();
};
