import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  UserCredential
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY!,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
//   projectId: process.env.FIREBASE_PROJECT_ID!,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
//   appId: process.env.FIREBASE_APP_ID!,
// };

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
const auth = getAuth(firebaseApp);
import admin from 'firebase-admin';

// Ensure reCAPTCHA is initialized once
// @ts-ignore

if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
  // @ts-ignore

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    'recaptcha-container',
    {
      size: 'invisible',
      callback: () => console.log('reCAPTCHA verified')
    }
  );
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'nearworker-dev',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Phone',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' }, // Accept ID Token instead of OTP
        phone: { label: 'Phone', type: 'text' }
      },
      async authorize(
        credentials
      ): Promise<{ id: string; phone: string } | null> {
        if (!credentials?.idToken || !credentials?.phone) {
          throw new Error('ID Token and Phone number are required');
        }

        try {
          // Verify Firebase ID Token
          // @ts-ignore
          const decodedToken = await admin
            .auth()
            .verifyIdToken(credentials.idToken);
          // @ts-ignore
          return { id: decodedToken.uid, phone: credentials.phone };
        } catch (error) {
          console.log('Invalid authentication token', error);
          throw new Error('Invalid authentication token');
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin'
  }
};

export { authConfig, auth };
