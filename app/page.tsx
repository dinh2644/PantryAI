'use client'

import { useState, useEffect } from "react";
import { PantryItem } from "./hooks/hooks";
// Firestore CRUD operations
import { createItem } from "./hooks/hooks";
import { getPantry } from "./hooks/hooks";
import { updateItem } from "./hooks/hooks";
import { deleteItem } from "./hooks/hooks";


export default function Home() {
  const [item, setItem] = useState<PantryItem>({
    name: "",
    quantity: 0,
    unit: ""
  })
  const [pantry, setPantry] = useState<PantryItem[]>([])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setItem((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle create
  const handleCreate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault

    await createItem(item.name, item.quantity, item.unit)
    setItem({
      name: "",
      quantity: 0,
      unit: ""
    })

    fetchInventory()
  }

  // Handle delete
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()

    await deleteItem(id)
  }


  // Refresh inventory
  const fetchInventory = async () => {
    setPantry(await getPantry());
  }
  useEffect(() => {

    fetchInventory()
  }, [pantry])
  return (
    <>
      <div>hello world</div>
    </>
  );
}
