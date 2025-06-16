import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase.js';

const email = 'admin@serendipia.com';
const password = 'admin123'; // Cambia esto por una contraseña segura

async function createAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Admin creado exitosamente:', userCredential.user.uid);
  } catch (error) {
    console.error('Error al crear el admin:', error);
  }
}

createAdmin();
