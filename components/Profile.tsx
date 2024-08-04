'use client'
import useUser from '@/app/hook/useUser';
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    LogOut,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Loading from './Loading';
import { supabaseClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { protectedPaths } from '@/lib/constant/protectedPaths';


const Profile = () => {
    const { data } = useUser();
    const queryClient = useQueryClient();
    const router = useRouter()

    const pathname = usePathname();


    // Handle log out
    const handleLogout = async () => {
        const supabase = supabaseClient();
        queryClient.clear();
        await supabase.auth.signOut();

        router.refresh();
        if (protectedPaths.includes(pathname)) {
            router.replace("/auth")
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild >
                    <Avatar className='cursor-pointer'>
                        <AvatarImage src={data?.picture_url!} />
                        <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-28 mt-1">
                    <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span onClick={handleLogout}>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default Profile