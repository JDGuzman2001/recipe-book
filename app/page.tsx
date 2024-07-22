"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context/userContext';
import { createClient } from "@/supabase/client";
import * as React from "react";
import { BookOpenIcon } from '@heroicons/react/24/solid'

export default function LoginPage() {
  const { user, handleSignInWithGoogle } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [loadingPage, setLoadingPage] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
        if (user) {
            try {
                const { data, error } = await supabase.from('users').select().eq('email', user.email).single();
                if (error) {
                    router.replace('/');
                    return;
                }
                if (data) {
                  console.log(data);
                  router.replace('/home');
                } else {
                    setLoadingPage(false);
                    console.log('No user data found');
                }
            } catch (error) {
                router.replace('/');
            }
        } else {
            setLoadingPage(false);
        }
    };
      checkUser();
  }, [user, router, supabase]);

  if (loadingPage) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <BookOpenIcon className="w-40 h-40 text-gray-500" />
            <span>Loading...</span>
        </div>
    );
  }
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-cyan-200 p-6">
      <div className="bg-gray-200 p-6 rounded-lg shadow-md">
        <BookOpenIcon className="w-48 h-48 mx-auto text-gray-500 mb-6" />
        <h1 className="text-2xl text-center mb-6">Mis recetas</h1>
        <Button
          onClick={handleSignInWithGoogle}
          className="w-full p-3 bg-white text-black hover:bg-slate-300 border border-black mb-2"
        >
          Sign In with Google
        </Button>
      </div>
    </main>
  );
}


