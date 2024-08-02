'use client'
import React, { useEffect, useState } from 'react'
import { PantryItem } from '@/app/firebase/actions';
import { getPantry } from '@/app/firebase/actions';
import { deleteItem } from '@/app/firebase/actions';
import { Button } from './ui/button';

const PantryItems = () => {

    const [pantry, setPantry] = useState<PantryItem[]>([])

    // fetch pantry items
    useEffect(() => {
        const fetchPantry = async () => {
            setPantry(await getPantry())
        }
        fetchPantry()
    }, [pantry])

    // Handle delete item
    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.preventDefault()
        await deleteItem(id)
    }
    return (
        <>
            {(pantry && pantry.length > 0) ? (
                pantry.map((item, index) => (
                    <div key={index} className="flex justify-between items-center gap-2 self-stretch py-3 px-0 border-b-2 border-gray-200">
                        {/* Left side */}
                        <div className='flex'>

                            <div className="flex flex-col ml-2">
                                <div className="self-stretch text-black font-['Roboto'] text-sm leading-5">{item.name}</div>
                                <div className="self-stretch text-black/50 font-['Roboto'] text-xs">Quantity: {item.quantity}</div>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className='flex items-center'>
                            <div className="text-black text-right font-['Roboto'] text-md font-medium leading-5 pr-4">Unit: {item.unit}</div>
                            <Button variant="destructive" onClick={(e) => handleDelete(e, item.id!)}>Delete</Button>
                        </div>

                    </div>
                ))

            ) : (
                <blockquote className="mt-6 border-l-2 pl-6 italic">
                    Pantry is empty
                </blockquote>
            )}

        </>

    )
}

export default PantryItems