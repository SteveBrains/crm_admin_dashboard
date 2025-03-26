import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: 'AIzaSyDWlOE9BwkgEyTnlNuEE-D8sfD11Wj4kxg',
//   authDomain: 'nearworker-dev.firebaseapp.com',
//   projectId: 'nearworker-dev',
//   storageBucket: 'nearworker-dev.firebasestorage.app',
//   messagingSenderId: '1060050174760',
//   appId: '1:1060050174760:web:5dfd326ee876578340c61d',
//   measurementId: 'G-LMNQQBWPNW'
// };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
const firebaseApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(firebaseApp);

export default clientAuth;
