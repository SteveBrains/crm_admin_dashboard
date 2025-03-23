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
import { auth as a } from '@/lib/auth.config';

const auth = a;

const formSchema = z.object({
  phone: z.string().min(10, { message: 'Enter a valid phone number' }),
  otp: z.string().optional()
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
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
    try {
      if (!confirmationResult) {
        // @ts-ignore
        const result = await signInWithPhoneNumber(
          auth,
          data.phone,
          window.recaptchaVerifier
        );
        setConfirmationResult(result);
        toast.success('OTP sent successfully!');
      } else {
        // Verify OTP
        const userCredential = await confirmationResult.confirm(data.otp);
        const idToken = await userCredential.user.getIdToken();

        // Send ID Token to NextAuth instead of OTP
        const res = await signIn('credentials', {
          idToken, // Send Firebase ID Token instead of OTP
          phone: data.phone,
          callbackUrl: callbackUrl ?? '/dashboard'
        });

        if (res?.error) {
          toast.error('Authentication failed');
        } else {
          toast.success('Signed In Successfully!');
        }
      }
    } catch (error) {
      toast.error('OTP verification failed');
      console.error('Error:', error);
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
            <Button disabled={loading} className='ml-auto w-full' type='submit'>
              Send OTP
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
                className='ml-auto w-full'
                type='submit'
              >
                Verify OTP
              </Button>
            </>
          )}

          {/* reCAPTCHA Container (Important for Firebase) */}
          <div id='recaptcha-container'></div>
        </form>
      </Form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            Or continue with
          </span>
        </div>
      </div>
      <GithubSignInButton />
    </>
  );
}
