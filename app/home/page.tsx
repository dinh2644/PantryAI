'use client'
import React, { useEffect, useState } from 'react'
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
import { PantryItem } from '../firebase/actions';
import { Button } from '@/components/ui/button';
import { createItem } from '../firebase/actions';
import { toast } from 'react-hot-toast';





const HomePage = () => {
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

    const handleCreate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        if (item.name === '' || item.quantity === 0 || item.unit === '') {
            toast.error("Inputs cannot be empty")
            return;
        }
        await createItem(item.name, item.quantity, item.unit)

    }


    return (
        <>
            <div className="flex m-10">
                {/* Left side */}
                <div className="w-2/5 h-12">
                    {/* Inputs */}
                    <div>
                        {/* Name */}
                        <div className="grid w-full max-w-sm items-center gap-1.5 py-2">
                            <Label htmlFor="name" className='font-semibold'>Name</Label>
                            <Input type="text" id="name" placeholder="Enter name" name="name" onChange={handleChange} value={item.name} />
                        </div>
                        {/* Quantity */}
                        <div className="grid w-full max-w-sm items-center gap-1.5 py-2">
                            <Label htmlFor="quantity" className='font-semibold'>Quantity</Label>
                            <Input type="number" id="quantity" placeholder="Enter quantity" name="quantity" onChange={handleChange} value={item.quantity} />
                        </div>
                        {/* Unit dropdown */}
                        <div className="grid w-full max-w-sm items-center gap-1.5 py-2">
                            <Label className='font-semibold'>Unit</Label>
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
                            <Input id="picture" type="file" className='w-6/12' />
                        </div>
                    </div>


                    {/* Pantry items */}
                    <Label className='font-semibold'>Pantry Items</Label>
                    <PantryItems />
                </div>

                {/* Right side */}
                <div className="w-3/5 h-12">

                </div>
            </div>


        </>
    )
}

export default HomePage