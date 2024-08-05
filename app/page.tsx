'use client'
import React, { useState, useTransition } from 'react'
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
import { createItem, PantryItem } from './supabase/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Navbar from "@/components/Navbar";
import { usePantry } from './supabase/PantryContext'


const HomePage = () => {
  const [item, setItem] = useState<PantryItem>({
    name: "",
    quantity: 0,
    unit: "",
  })
  const [isPending, startTransition] = useTransition()
  const { fetchPantry } = usePantry()


  // Handle create item
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      if (item.name === '' || item.quantity === 0 || item.unit === '') {
        toast.error("Inputs cannot be empty");
        return;
      }

      try {
        await createItem(item);
        fetchPantry();
        setItem({
          name: "",
          quantity: 0,
          unit: ""
        });
        toast.success("Item added successfully");
      } catch (error) {
        console.error('Error creating item:', error);
        toast.error("Can't create item");
      }
    });
  };


  // Handling change
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

  return (
    <>
      <Navbar />
      <div className="pt-16 sm:pt-0 flex flex-col sm:flex-row justify-center items-center min-h-screen gap-10">

        {/* Inputs */}
        <div className="shadow-xl w-auto sm:w-4/12 flex flex-col justify-center items-center rounded-3xl px-4">

          {/* Form input */}
          <div className="grid w-full max-w-sm items-center gap-2.5 py-2 pt-10">
            <Label htmlFor="name" className='font-semibold text-lg sm:text-2xl'>Name</Label>
            <Input type="text" id="name" placeholder="Enter name" name="name" onChange={handleChange} value={item.name} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-2.5 py-2">
            <Label htmlFor="quantity" className='font-semibold text-lg sm:text-2xl'>Quantity</Label>
            <Input type="number" id="quantity" placeholder="Enter quantity" name="quantity" onChange={handleChange} value={item.quantity} />
            <div className="text-gray-600 text-xs sm:text-sm pl-1 ">
              Whole number only
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-2.5 py-2 pb-5">
            <Label className='font-semibold text-lg sm:text-2xl'>Unit</Label>
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
            <form onSubmit={handleCreate}>
              <Button className='mr-2 bg-black text-xs sm:text-sm' type='submit' disabled={isPending}>{isPending ? 'Adding...' : 'Add to Pantry'}</Button>
            </form>
            <Button className='mr-2 text-xs sm:text-sm' variant="outline" onClick={() => setItem({ name: '', quantity: 0, unit: '' })}>Clear</Button>



          </div>
        </div>


        {/* Pantry items */}
        <PantryItems />

      </div>

    </>
  )
}

export default HomePage