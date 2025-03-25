'use server';

import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthConfig } from 'next-auth';
import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin only on the server
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: 'nearworker-dev',
      //  process.env.FIREBASE_ADMIN_SDK_FIREBASE_PROJECT_ID,
      privateKey:
        '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCj+FrMNTEkLk2f\nCJ6H9qzu9geVNomqONXrupWtAdDVQypOdoxZdIK7p/dH5L9QvTdWE8RjUg5matpf\nNY8S6FgyJCyhebyaNj4aaIVxuXw0xwmqpJbOx8fDGu1ULZXBR65TgKv5+jgxQgS2\nCOXKuH3y5YJWtvkNPi1/HN3uzEiVbY+0qbyXA6/ELXGbVpJzLJeNk2Ze8nzByCTs\ndRF8fWFv5+MLqsjXb4lEL/7A6A5Wq9aNUr9UpjR2/+jdZJ2wrVo1/TrGhWizt+2x\n3wguPX9IkpSvfMwhP24XnW1cUl4U/xFEHThdoCbSuO8dAzUvNBT4QNYxjWp8INZT\npslPLC/9AgMBAAECggEAG49pd4xzQ5ES0+nHd7PzEkFBOgfOMNHXxwT4FnnJJ6df\n64tKgNiwBqmvSyK8M25yaCHvbwBCUl2gccNXVoa+GENzSvrixArc+mRaFajnIxnX\nWprKjFwRDA6xGGaHFtMdDoUAowY3PrRJhW1Obnn/FX4VH80mZF7wl7564SHuC0t3\nqSygZVMg2Mh2MzIvUS2w6N7MjC/plYAdz+HT6x6yq66HuqIwjIBQ2c45K6f6I+8q\n0Aek5SzRbto6fUIWxTpFk4mpA8WlONPv4r/AroG6RR/8jy4qu4aOBzfxqL+U0eLk\nsWg3ZK2xEHTZAA05GUWK3rzI1j29+G4I+0lX0huTwwKBgQDRn5c32t7bfYLE3T0Y\nRiLg5m+IwiFedi2HMHwb5PhKo9i2NxVSVXRDWB4+T97Hed8hXgdmVDHTbcVIR+mr\nQ0qfBQ7YHrmi+Gy1v8wvEGNsmTlVRS4SZVcGyjE7uxF51eP7K0wrsv1boD8ick4y\nUZiU9yJw+hFIzZANbMmvUsqcLwKBgQDIPxtWINeWTwaiweDyGO9nXkclV9R1Zpqq\nv6oWZXVQYH/+5I01X439lbso/Uk86vgIb/jh4Lohny5lJeFLkYjTezlSS8v7T9/7\n+2ysGEDMg+g6N52pgg6M+s4eTSduPBFqqQXVBVbuzCEDG9t7Qq+6JPCHkJjFGfgQ\nt63ROP5PkwKBgEfyvNZg+yje1Wl4fiW8vO/wZ8vKxeVELrA+BfsVBduojRNNqLXP\nus36irbcdxyESf+L5IJM16U4AgSjGiK8P/qAo+2t7g1vsvBW2mA1AcsedD0+N2f8\n/HfKIkfcF014Cn4FCGnfT3KJd+H81bYTp4lJobqhOhmA5LaW5kqU4hHlAoGAOAG+\niZZh9f5gYsFLQytKOmUaDQ3FtJhgBgXZcq4p47M52XbfL+Br/FMWp94/z7QAb4ux\n1qteI+07srqnitVHqa67V5MvmDi88uNdf7zA0vLJzw6jIDfqDfBQGhWGQ8S1MlnX\n8b6uk9ewHAh8mLsMH0oZpDEDKY2b3kEhcnU4W9UCgYEApP/8HIWoSga+7ARwQXzC\neoZl1YQFcjuCDQtCzYyT1wqhqzZqDxW2xgiUrb56RGaxo0o1dlp6MGl9oOT41Eof\nTsMOeuOXsXX+yTBDT/Zo7nkwordJsWpLdgk2lV6vh8ATc+Ga5qYoX9HZiDFoksVC\nx13IgSKREMJcVn1XYvkcSp0=\n-----END PRIVATE KEY-----\n',
      // process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail:
        'firebase-adminsdk-w2850@nearworker-dev.iam.gserviceaccount.com'
      //  process.env.FIREBASE_ADMIN_SDK_CLIENT_EMAIL,
    })
  });
}

const auth = getAuth();

export async function authConfig(): Promise<NextAuthConfig> {
  return {
    providers: [
      CredentialsProvider({
        name: 'Phone',
        credentials: {
          idToken: { label: 'ID Token', type: 'text' },
          phone: { label: 'Phone', type: 'text' }
        },
        async authorize(credentials) {
          if (!credentials?.idToken || !credentials?.phone) {
            throw new Error('ID Token and Phone number are required');
          }

          try {
            // @ts-ignore
            const decodedToken = await auth.verifyIdToken(credentials.idToken);
            console.log('decodedToken------------', decodedToken);
            return {
              id: decodedToken.user_id,
              phone: decodedToken.phone_number
            };
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
}
