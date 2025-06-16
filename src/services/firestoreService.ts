import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  DocumentData,
  QueryDocumentSnapshot,
  QueryConstraint,
  CollectionReference as FirebaseCollectionRef
} from 'firebase/firestore'; 

import { db } from './firebase';

type CollectionReference = FirebaseCollectionRef<DocumentData>;

export class FirestoreService<T extends DocumentData> {
  constructor(private collectionName: string) {}

  // Obtener referencia a la colección
  private getCollection(): CollectionReference {
    return collection(db, this.collectionName) as unknown as CollectionReference;
  }

  // Crear un nuevo documento
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const collectionRef = this.getCollection();
    const docData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collectionRef, docData);
    return { id: docRef.id, ...docData } as unknown as T;
  }

  // Leer un documento por ID
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return { id: docSnap.id, ...data } as unknown as T;
  }

  // Actualizar un documento
  async update(id: string, data: Partial<T>) {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { id, ...data };
  }

  // Eliminar un documento
  async delete(id: string) {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
    return { id };
  }

  // Obtener todos los documentos de la colección
  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(this.getCollection());
    return querySnapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData
      } as unknown as T;
    });
  }

  // Consultar documentos con filtros
  async query(filters: QueryConstraint[]): Promise<T[]> {
    const q = query(this.getCollection(), ...filters);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData
      } as unknown as T;
    });
  }

  // Convertir un documento de Firestore a un objeto de tipo T
  protected docToType(doc: QueryDocumentSnapshot): T {
    const data = doc.data();
    return { id: doc.id, ...data } as unknown as T;
  }
}
