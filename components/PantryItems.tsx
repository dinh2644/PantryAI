'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../app/client';
import { PantryItem } from '@/app/supabase/actions';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { Label } from '@radix-ui/react-label';

interface PantryItemsProps {
    pantry: PantryItem[]
    fetchPantry: () => void
}

const PantryItems = ({ pantry, fetchPantry }: PantryItemsProps) => {

    useEffect(() => {
        fetchPantry()
    }, [])

    // Handle delete item
    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.preventDefault();
        const { error } = await supabase.from("pantry").delete().eq("id", id);
        if (error) {
            console.log(error);
            toast.error("Can't delete item")
        } else {
            fetchPantry();
        }
    }
    return (
        <>

            <div className="overflow-y-auto flex-grow  max-h-[calc(100vh-450px)]  bg-white rounded-lg w-full px-48 boxContainer">
                <Label className='font-semibold text-lg'>Pantry Items</Label>
                <div className="text-gray-600 text-sm mb-3">
                    Sorted by quantity
                </div>
                {(pantry && pantry.length > 0) ? (
                    pantry.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2 self-stretch py-3 border-b-2 border-gray-200 w-full">
                            {/* Left side */}
                            <div className='flex'>

                                <div className="flex flex-col ml-2">
                                    <div className="self-stretch text-black text-lg leading-5 font-medium">{item.name}</div>
                                    <div className="self-stretch text-black/50 text-sm">Quantity: {item.quantity}</div>
                                </div>
                            </div>

                            {/* Right side */}
                            <div className='flex items-center'>
                                <div className="text-black text-right text-md leading-5 pr-4">Unit: {item.unit === 'piece' && 'pc' || item.unit === 'gram' && 'g' || item.unit === 'milliliter' && 'ml' || item.unit === 'teaspoon' && 'tsp' || item.unit === 'tablespoon' && 'tbsp' || item.unit === 'cup' && 'cup'}</div>
                                <Button variant="destructive" onClick={(e) => handleDelete(e, item.id!)} className='mr-2'>Delete</Button>
                                <Button variant="outline">Edit</Button>
                            </div>

                        </div>
                    ))

                ) : (
                    <blockquote className="mt-6 border-l-2 pl-6 italic">
                        Pantry is empty
                    </blockquote>
                )}
            </div>
        </>

    )
}

export default PantryItems