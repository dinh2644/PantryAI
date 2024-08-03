'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../app/client';
import { PantryItem } from '@/app/supabase/actions';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { Label } from '@radix-ui/react-label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PantryItemsProps {
    pantry: PantryItem[]
    fetchPantry: () => void
}

const PantryItems = ({ pantry, fetchPantry }: PantryItemsProps) => {
    const [newValue, setNewValue] = useState<PantryItem>(
        {
            name: '',
            quantity: 0,
            unit: ''
        }
    );
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

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

    // handle edit
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setNewValue((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Handle update
    const handleEdit = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.preventDefault();
        // validation
        if (newValue.name.trim() === "" || newValue.quantity === 0 || newValue.unit.trim() === "") {
            toast.error("Required fields cannot be empty!")
            return
        }
        const { error } = await supabase
            .from("pantry")
            .update(newValue)
            .eq("id", id);
        if (error) {
            console.log(error);
            toast.error("Can't update item")
        } else {
            setNewValue({
                name: '',
                quantity: 0,
                unit: ''
            });
            fetchPantry()
            setDialogOpen(false)
        }
    };

    const handleUnitChange = (value: string) => {
        setNewValue((prev) => ({
            ...prev,
            unit: value
        }))
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
                                {/* <Button variant="outline">Edit</Button> */}
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" onClick={() => setDialogOpen(true)}>Edit</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Edit item</DialogTitle>
                                            <DialogDescription>
                                                Make changes to this pantry item
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    className="col-span-3"
                                                    name="name"
                                                    value={newValue.name}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="quantity" className="text-right">
                                                    Quantity
                                                </Label>
                                                <Input
                                                    id="quantity"
                                                    className="col-span-3"
                                                    name="quantity"
                                                    value={newValue.quantity}
                                                    onChange={handleChange}

                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="unit" className="text-right">
                                                    Unit
                                                </Label>
                                                <Select value={newValue.unit} onValueChange={handleUnitChange}>
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
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={(e) => handleEdit(e, item.id!)}>Save changes</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
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