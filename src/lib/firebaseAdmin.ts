import {
  initializeApp,
  cert,
  getApps,
  getApp,
  ServiceAccount
} from 'firebase-admin/app';

const credentials: ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_SDK_FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_SDK_CLIENT_EMAIL
};

const firebaseAdmin = getApps().length
  ? getApp()
  : initializeApp({ credential: cert(credentials) });

export default firebaseAdmin;
