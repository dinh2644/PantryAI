require('dotenv').config({ path: '../.env' })


import { createClient } from "@supabase/supabase-js";

const URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const API_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(URL, API_KEY);