"use server"
import { supabaseServer } from "@/lib/supabase/server"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

export interface PantryItem {
    id?: number
    name: string,
    quantity: number,
    unit: string

}

// CREATE
export async function createItem(item: PantryItem) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("pantry")
        .insert({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit
        })
        .single()

    if (error) {
        console.error('Error inserting item:', error)
        throw error
    }

    revalidatePath("/")
    return data

}

// READ
export async function getPantry() {
    noStore();
    const supabase = await supabaseServer();

    // Policies that are set up automatically grab the user's own pantry items without needing to specify id
    return await supabase.from("pantry").select("*")

}
// UPDATE
export async function updateItem(id: Number, item: PantryItem) {
    const supabase = await supabaseServer();

    const { error } = await supabase.from("pantry").update({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
    }).eq("id", id)

    if (error) {
        console.error('Error updating item:', error)
        throw error
    }

    revalidatePath("/")

}

// DELETE
export async function deleteItem(id: number) {
    const supabase = await supabaseServer();

    const { error } = await supabase.from("pantry").delete().eq("id", id)

    if (error) {
        console.error('Error deleting item:', error)
        throw error
    }

    revalidatePath("/")

}

