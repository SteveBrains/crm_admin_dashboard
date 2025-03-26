import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

const authConfig = {
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
          // const decodedToken = await auth.verifyIdToken(credentials.idToken);
          const decodedToken: any = await fetch(
            `${process.env.AUTH_URL}/api/verify-token}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ idToken: credentials.idToken })
            }
          );

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
} satisfies NextAuthConfig;

export default authConfig;
