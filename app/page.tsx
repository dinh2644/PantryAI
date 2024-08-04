'use client'

// import { useState, useEffect } from "react";
// import { PantryItem } from "./firebase/actions";

// // Firestore CRUD operations

import React from 'react'
import PantryIcon from "../public/pantry.png"
import { auth } from "../firebase"
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Google from "../public/google.png"
import { useAuthState } from "react-firebase-hooks/auth"
import { useRouter } from 'next/navigation';
import Loading from "../components/Loading"



export default function Landing() {
  const googleAuth = new GoogleAuthProvider();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();


  if (loading) {
    return <Loading />
  }

  // Check first if user is signed in
  if (user) {
    router.push("/home");
  }

  // Handle login
  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      await signInWithPopup(auth, googleAuth);
      router.push("/home")


    } catch (error) {
      console.error(error);

    }
  }

  return (
    <>
      <main className="min-h-screen flex flex-col justify-center items-center">
        {/* Icon and PantryText */}
        <div className="flex justify-center items-center">
          <Image
            src={PantryIcon}
            width={150}
            height={150}
            alt="Picture of cartoon shiba inu"
            className="mr-5"
          />
          <div className="flex flex-col">
            <h1 className="text-6xl">PantryAI</h1>
            <div className='text-gray-600 font-medium text-lg pl-1 pt-1'>Your AI-Assistant Pantry UI</div>

          </div>

        </div>
        <div className="flex flex-col justify-center items-center">
          {/* Google sign in button */}
          <Button className="bg-black rounded-lg w-60 p-7 my-5 mt-12"
            onClick={handleLogin}
          >
            <Image
              src={Google}
              width={30}
              height={30}
              alt="Picture of cartoon shiba inu"
              className="mr-2"
            />
            <span className="text-white font-semibold text-lg">Sign in with Google</span>
          </Button>
          {/* Waitlist */}
          <Button className="bg-gray-300 rounded-lg w-52 p-7 hover:bg-gray-200">
            <span className="text-black font-semibold text-lg">Join waitlist</span>
          </Button>

        </div>
      </main>
    </>
  );

}