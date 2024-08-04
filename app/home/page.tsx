'use client'
import React, { useRef, useState } from 'react'
import { auth } from "../../firebase"
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import Loading from "../../components/Loading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import PantryItems from '@/components/PantryItems';
import { PantryItem } from '../supabase/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { supabase } from '../../app/client';
import { usePantry } from '../PantryContext';

const HomePage = () => {
    const { fetchPantry } = usePantry()
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [item, setItem] = useState<PantryItem>({
        name: "",
        quantity: 0,
        unit: "",
    })

    if (loading) {
        return <Loading />
    }
    if (!user) {
        return router.push("/")
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setItem((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleUnitChange = (value: string) => {
        setItem((prev) => ({
            ...prev,
            unit: value
        }))
    }
    // Handle create pantry item
    const handleCreate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        if (item.name === '' || item.quantity === 0 || item.unit === '') {
            toast.error("Inputs cannot be empty")
            return;
        }
        const { error } = await supabase.from("pantry").insert(item);

        if (error) {
            console.log(error);
            toast.error("Can't create item")
        } else {
            setItem({
                name: "",
                quantity: 0,
                unit: ""
            });

            fetchPantry()
        }
    }

    return (
        <>
            <div className="flex flex-col md:flex-row justify-center items-center min-h-screen gap-10">

                {/* Inputs */}
                <div className="shadow-xl w-4/12 flex flex-col justify-center items-center rounded-3xl">

                    {/* Form input */}
                    <div className="grid w-full max-w-sm items-center gap-2.5 py-2 pt-10">
                        <Label htmlFor="name" className='font-semibold text-2xl'>Name</Label>
                        <Input type="text" id="name" placeholder="Enter name" name="name" onChange={handleChange} value={item.name} />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-2.5 py-2">
                        <Label htmlFor="quantity" className='font-semibold text-2xl'>Quantity</Label>
                        <Input type="number" id="quantity" placeholder="Enter quantity" name="quantity" onChange={handleChange} value={item.quantity} />
                        <div className="text-gray-600 text-sm pl-1 ">
                            Whole number only
                        </div>
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-2.5 py-2 pb-5">
                        <Label className='font-semibold text-2xl'>Unit</Label>
                        <Select value={item.unit} onValueChange={handleUnitChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="piece">pc</SelectItem>
                                <SelectItem value="gram">g</SelectItem>
                                <SelectItem value="milliliter">ml</SelectItem>
                                <SelectItem value="teaspoon">tsp</SelectItem>
                                <SelectItem value="tablespoon">tbsp</SelectItem>
                                <SelectItem value="cup">cup</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='py-2 flex pb-10'>
                        <Button onClick={handleCreate} className='mr-2 bg-black'>Add to Pantry</Button>
                        <Button className='mr-2' variant="outline" onClick={() => setItem({ name: '', quantity: 0, unit: '' })}>Clear</Button>

                    </div>
                </div>


                {/* Pantry items */}
                <PantryItems />

            </div>

        </>
    )
}

export default HomePage