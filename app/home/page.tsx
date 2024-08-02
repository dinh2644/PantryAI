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
import { PantryItem } from '../firebase/actions';
import { Button } from '@/components/ui/button';
import { createItem } from '../firebase/actions';
import { toast } from 'react-hot-toast';
import { Camera, CameraType } from "react-camera-pro";





const HomePage = () => {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [item, setItem] = useState<PantryItem>({
        name: "",
        quantity: 0,
        unit: "",
    })
    const camera = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [numberOfCameras, setNumberOfCameras] = useState(0);
    const [isCameraOn, setIsCameraOn] = useState(false);

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

    const handleTakePhoto = () => {
        if (camera.current) {
            const photo = camera.current.takePhoto();
            if (typeof photo === 'string') {
                setImage(photo);
                // setIsCameraOn(false);
            } else {
                console.log('Photo taken as ImageData object');
            }
        }
    };


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

                        </div>
                    </div>


                    {/* Pantry items */}
                    <Label className='font-semibold'>Pantry Items</Label>
                    <PantryItems />
                </div>

                {/* Right side */}
                <div className="w-3/5 h-12">
                    <div className="flex">
                        <div style={{ width: '350px', height: '250px' }} className='flex flex-col'>
                            {isCameraOn ? (
                                <Camera
                                    ref={camera}
                                    aspectRatio={4 / 3}
                                    numberOfCamerasCallback={setNumberOfCameras}
                                    facingMode="user"
                                    errorMessages={{
                                        noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                                        permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                                        switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
                                        canvas: 'Canvas is not supported.'
                                    }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                                    Camera is off
                                </div>
                            )}
                        </div>

                        {/* Camera buttons */}
                        <Button onClick={() => { setIsCameraOn(!isCameraOn); setImage(null) }} className='bg-slate-500'>{isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}</Button>
                        {isCameraOn && <Button onClick={handleTakePhoto} className='bg-green-600'>Take Photo</Button>}
                        {numberOfCameras > 1 && isCameraOn && (
                            <Button className='bg-orange-700' onClick={() => camera.current?.switchCamera()}>Switch Camera</Button>
                        )}
                        {image && <img src={image} alt='Taken photo' style={{ maxWidth: "400px" }} />}
                    </div>

                </div>
            </div>


        </>
    )
}

export default HomePage