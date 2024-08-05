'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../app/client';
import { PantryItem, deleteItem, updateItem } from '@/app/supabase/actions';
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
import { usePantry } from '@/app/supabase/PantryContext';
import PantryLoading from './PantryLoading';

const PantryItems = () => {
    const { pantry, isLoading, fetchPantry } = usePantry();

    const [newValue, setNewValue] = useState<PantryItem>(
        {
            name: '',
            quantity: 0,
            unit: ''
        }
    );
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [editingItemID, setEditingItemID] = useState<number>(0)

    // Handle delete item
    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        try {
            await deleteItem(id);
            fetchPantry();
            toast.success("Item deleted successfully");
        } catch (error) {
            console.log(error);
            toast.error("Can't delete item");
        }
    }

    // Handle update
    const handleEdit = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {
            // validation
            if (newValue.name.trim() === "" || newValue.quantity === 0 || newValue.unit.trim() === "") {
                toast.error("Required fields cannot be empty!")
                return
            }
            await updateItem(id, newValue);
            fetchPantry();
            setNewValue({
                name: '',
                quantity: 0,
                unit: ''
            });
            setDialogOpen(false);
            toast.success("Item updated successfully");

        } catch (error) {
            console.log(error);
            toast.error("Can't update item");
        }
    }

    // Handling change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setNewValue((prev) => ({
            ...prev,
            [name]: value,
        }))
    }
    const handleUnitChange = (value: string) => {
        setNewValue((prev) => ({
            ...prev,
            unit: value
        }))
    }

    // Handle dialog open and editing item's id
    const handleDialog = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
        e.preventDefault();
        setDialogOpen(true);
        setEditingItemID(id);
        console.log(id);
    }





    return (
        <>
            <div className="shadow-xl min-w-max mb-5 sm:mb-0 flex flex-col items-center rounded-3xl py-3 sm:py-8 min-h-[300px] max-h-[calc(100vh-250px)]">
                <div className="mb-4 pt-3">
                    <Label className='font-semibold text-2xl px-16 text-center'>Pantry Items</Label>
                    <div className="text-gray-600 text-md px-16 text-center">
                        Sorted by quantity
                    </div>
                </div>
                {isLoading ? <PantryLoading /> : (
                    <div className="flex flex-col flex-grow w-full overflow-y-auto">
                        {(pantry && pantry.length > 0) ? (
                            <div className="flex-grow">
                                {pantry.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-7 lg:gap-40 self-stretch py-5 mx-12 border-b-2">
                                        {/* Left side */}
                                        <div className="flex flex-col">
                                            <div className=" text-black text-md sm:text-lg leading-5 font-medium">{item.name}</div>
                                            <div className=" text-black/50 text-xs sm:text-sm">Quantity: {item.quantity}</div>
                                        </div>

                                        {/* Right side */}
                                        <div className='flex items-center'>
                                            <div className="text-black text-center sm:text-right text-sm sm:text-md leading-5 pr-4">Unit: {item.unit === 'piece' && 'pc' || item.unit === 'gram' && 'g' || item.unit === 'milliliter' && 'ml' || item.unit === 'teaspoon' && 'tsp' || item.unit === 'tablespoon' && 'tbsp' || item.unit === 'cup' && 'cup'}</div>
                                            <Button variant="destructive" onClick={(e) => handleDelete(item.id!, e)} className='mr-2'>Delete</Button>
                                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" onClick={(e) => handleDialog(e, item.id!)}>Edit</Button>
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
                                                        <Button type="submit" onClick={(e) => { handleEdit(editingItemID, e); console.log('CP 2: ', editingItemID) }}>Save changes</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-grow flex items-center justify-center">
                                <blockquote className="border-l-2 pl-6">
                                    Empty
                                </blockquote>
                            </div>

                        )}
                    </div>
                )}

            </div>
        </>

    )
}

export default PantryItems