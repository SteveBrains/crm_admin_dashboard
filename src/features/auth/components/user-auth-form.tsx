'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import GithubSignInButton from './github-auth-button';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  UserCredential
} from 'firebase/auth';
import clientAuth from '@/lib/firebaseClient';

const auth = clientAuth;

const formSchema = z.object({
  phone: z.string().min(10, { message: 'Enter a valid phone number' }),
  otp: z.string().optional()
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: { phone: '', otp: '' }
  });

  useEffect(() => {
    // @ts-ignore
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      // @ts-ignore
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response: any) => {
            console.log('reCAPTCHA solved:', response);
          }
        }
      );
    }
  }, []);
  const onSubmit = async (data: UserFormValue) => {
    setLoading(false);
    const phone = `+91${data.phone}`;
    try {
      if (!confirmationResult) {
        setLoading(true);
        // @ts-ignore
        const result = await signInWithPhoneNumber(
          auth,
          phone,
          // @ts-ignore

          window.recaptchaVerifier
        );
        setConfirmationResult(result);
        setLoading(false);
        toast.success('OTP sent successfully!');
      } else {
        setLoading(true);
        // Verify OTP
        const userCredential = await confirmationResult.confirm(data.otp);
        const idToken = await userCredential.user.getIdToken();

        // Send ID Token to NextAuth instead of OTP
        const res = await signIn('credentials', {
          idToken, // Send Firebase ID Token instead of OTP
          phone,
          callbackUrl: callbackUrl ?? '/dashboard'
        });

        if (res?.error) {
          toast.error('Authentication failed');
          setLoading(false);
        } else {
          toast.success('Signed In Successfully!');
          setLoading(false);
        }
        setLoading(false);
      }
    } catch (error) {
      toast.error('OTP verification failed');
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-2'
        >
          {/* Phone Number Field */}
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    type='tel'
                    placeholder='Enter your phone number...'
                    disabled={loading || confirmationResult}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!confirmationResult ? (
            <Button
              disabled={loading}
              className='mt-2 ml-auto w-full cursor-pointer'
              type='submit'
            >
              {loading ? 'Loading...' : 'Send OTP'}
            </Button>
          ) : (
            <>
              {/* OTP Field */}
              <FormField
                control={form.control}
                name='otp'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter OTP...'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={loading}
                className='mt-2 ml-auto w-full cursor-pointer'
                type='submit'
              >
                {loading ? 'Loading...' : 'Verify OTP'}
              </Button>
            </>
          )}

          {/* reCAPTCHA Container (Important for Firebase) */}
          <div id='recaptcha-container'></div>
        </form>
      </Form>
    </>
  );
}
