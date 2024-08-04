'use client'
import React from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import PantryIcon from "../../public/pantry.png"
import Google from "../../public/google.png"

import { supabaseClient } from '@/lib/supabase/client';
const Page = () => {

    const handleLoginWithOAuth = () => {
        const supabase = supabaseClient();

        supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: location.origin + "/auth/callback" }
        })
    }

    return (
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
                <Button className="bg-black rounded-md w-60 p-7 my-5 mt-12"
                    onClick={handleLoginWithOAuth}
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
                <Button className="bg-gray-300 rounded-md w-52 p-7 hover:bg-gray-200">
                    <span className="text-black font-semibold text-lg">Join waitlist</span>
                </Button>

            </div>
        </main>
    )
}

export default Page