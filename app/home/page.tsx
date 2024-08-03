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
import Recipe from '@/components/Recipe'
import { supabase } from '../../app/client';
import Webcam from '@/components/Webcam';


const HomePage = () => {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [item, setItem] = useState<PantryItem>({
        name: "",
        quantity: 0,
        unit: "",
    })
    const [pantry, setPantry] = useState<PantryItem[]>([])

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

    // Handle fetch pantry items
    // fetch pantry items
    const fetchPantry = async () => {
        const { data } = await supabase
            .from("pantry")
            .select()
            .order("quantity", { ascending: false });

        if (data) {
            setPantry(data as PantryItem[]);
        } else {
            setPantry([]);
        }

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
            <div className="flex mx-10 my-5">
                {/* Left side */}
                <div className="w-1/2 h-12">
                    {/* Inputs */}
                    <div className="overflow-y-auto flex-grow max-h-[calc(100vh-450px)] bg-white rounded-lg w-full px-32 py-2 boxContainer">

                        {/* Name */}
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="name" className='font-semibold text-lg'>Name</Label>
                            <Input type="text" id="name" placeholder="Enter name" name="name" onChange={handleChange} value={item.name} />
                        </div>
                        {/* Quantity */}
                        <div className="grid w-full max-w-sm items-center gap-1.5 py-2">
                            <Label htmlFor="quantity" className='font-semibold text-lg'>Quantity</Label>
                            <Input type="number" id="quantity" placeholder="Enter quantity" name="quantity" onChange={handleChange} value={item.quantity} />
                            <div className="text-gray-600 text-sm pl-1 ">
                                Whole number only
                            </div>
                        </div>
                        {/* Unit dropdown */}
                        <div className="grid w-full max-w-sm items-center gap-1.5 py-2">
                            <Label className='font-semibold text-lg'>Unit</Label>
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

                        {/* Add item button */}
                        <div className='py-4 flex '>
                            <Button onClick={handleCreate} className='mr-2 bg-black'>Add to Pantry</Button>
                            <Button className='mr-2' variant="outline" onClick={() => setItem({ name: '', quantity: 0, unit: '' })}>Clear</Button>

                        </div>
                    </div>


                    {/* Pantry items */}
                    <PantryItems pantry={pantry} fetchPantry={fetchPantry} />
                </div>

                {/* Right side */}
                <div className="w-1/2 h-12">
                    {/* Camera */}
                    <Webcam />

                    <Recipe pantry={pantry} />

                </div>

            </div>


        </>
    )
}

export default HomePage