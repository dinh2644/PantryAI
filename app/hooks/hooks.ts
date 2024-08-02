import { db } from '@/firebase'
import { updateDoc, collection, getDoc, getDocs, query, doc, deleteDoc, setDoc, addDoc } from 'firebase/firestore';

export interface PantryItem {
    id?: string
    name: string,
    quantity: number,
    unit: string

}

/** Firebase actions **/
// CREATE
export const createItem = async (name: string, quantity: number, unit: string) => {
    await addDoc(collection(db, "inventory"), {
        name: name,
        quantity: quantity,
        unit: unit,
    });


}
// READ
export const getPantry = async () => {
    const querySnapshot = await getDocs(collection(db, "inventory"));
    const inventoryList: PantryItem[] = []
    querySnapshot.forEach((doc) => {
        inventoryList.push({
            id: doc.id,
            ...(doc.data()) as PantryItem
        })
    });
    return inventoryList
}
// UPDATE
export const updateItem = async () => {

    const washingtonRef = doc(db, "inventory", "DC");

    await updateDoc(washingtonRef, {
        capital: true
    });


}
// DELETE
export const deleteItem = async (id: any) => {
    await deleteDoc(doc(db, "inventory", id));

}

