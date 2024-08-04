'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabaseClient } from '@/lib/supabase/client'

const initUser = {
    created_at: "",
    display_name: "",
    email: "",
    id: "",
    picture_url: ""
}

const useUser = () => {
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data } = await supabase.auth.getSession();

            if (data.session?.user) {
                // fetch user info from "profiles" table
                const { data: user } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", data.session.user.id)
                    .single();
                console.log(user);

                return user
            }

            return initUser;
        }
    })
}

export default useUser