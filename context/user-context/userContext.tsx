"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/supabase/client';

interface UserContextType {
  user: any;
  setUser: (user: any) => void;
  handleSignInWithGoogle: () => void;
  getRecipes: () => void;
  recipes: any;
  setRecipes: (projects: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<any>(null);
 

  const supabase = createClient();


  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  // Handle login with Google.
  const handleSignInWithGoogle = async () => {
    const res = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `https://recipe-book-woad-beta.vercel.app/home`,
      },
    });
  };

  // Gets the authenticated user's projects.
  const getRecipes = async () => {
    const { data: recipes, error } = await supabase.from('recipes').select().filter('email', 'eq', user.email);
    if (error) {
      return;
    }
    setRecipes(recipes);
  }

  return (
    <UserContext.Provider
      value={{ user, setUser, handleSignInWithGoogle, getRecipes, recipes, setRecipes }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
