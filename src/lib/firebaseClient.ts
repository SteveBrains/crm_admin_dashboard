import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDWlOE9BwkgEyTnlNuEE-D8sfD11Wj4kxg',
  authDomain: 'nearworker-dev.firebaseapp.com',
  projectId: 'nearworker-dev',
  storageBucket: 'nearworker-dev.firebasestorage.app',
  messagingSenderId: '1060050174760',
  appId: '1:1060050174760:web:5dfd326ee876578340c61d',
  measurementId: 'G-LMNQQBWPNW'
};

const firebaseApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(firebaseApp);

export default clientAuth;
