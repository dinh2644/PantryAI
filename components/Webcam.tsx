'use client'

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import React, { useEffect, useRef, useState } from 'react'
import { Camera } from "react-camera-pro";
import { Button } from '@/components//ui/button';
import { GenerateContentResult, GoogleGenerativeAI } from '@google/generative-ai';
import { Buffer } from 'buffer';
import { PantryItem } from '../app/supabase/actions'
import { supabase } from '../app/client';
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { usePantry } from '@/app/supabase/PantryContext';


const Webcam = () => {
    const { fetchPantry } = usePantry();
    const [image, setImage] = useState<string | null>(null);
    const drawerCloseRef = useRef<HTMLButtonElement>(null);
    const camera = useRef<any>(null);
    const [item, setItem] = useState<PantryItem>({
        name: "",
        quantity: 0,
        unit: "",
    })
    // console.log('item: ', item)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isCameraOn, setIsCameraOn] = useState<boolean>(false)

    const handleTakePhoto = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsCameraOn(true)
        handleCaptureAndGenerate();
    };

    const handleCaptureAndGenerate = async () => {
        if (camera.current) {
            try {
                const photo = camera.current.takePhoto();
                if (typeof photo === 'string') {
                    setImage(photo);
                    await generateContent(photo);
                } else {
                    console.log('Photo taken as ImageData object');
                    toast.error("Unable to process photo");
                }
            } catch (error) {
                console.error('Error capturing and generating:', error);
                toast.error("Error processing photo");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (item.name && item.quantity && item.unit) {
            handleCreate();

        }
    }, [item]);

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    const MODEL_NAME = "gemini-1.5-flash"
    const genAI = new GoogleGenerativeAI(API_KEY!);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const base64ToBuffer = (base64: string) => {
        const [, data] = base64.split(',');
        return Buffer.from(data, 'base64');
    };

    const generateContent = async (photo: string) => {
        if (photo) {
            try {
                // Convert base64 string to Buffer
                const imageBuffer = base64ToBuffer(photo);
                const imageInput = {
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: "image/jpeg"
                    }
                } as const;

                const prompt = `
                Analyze the image and identify the object. Respond strictly in this format without any additional text:

                item_name, quantity, unit

                Guidelines:
                1. item_name: Use the most common, generic name for the item (e.g., "apple" not "Granny Smith apple")
                2. quantity: Provide a numerical estimate. If unsure, default to 1.
                3. unit: Use one of these units: pc (for countable items), g (for solid foods), ml (for liquids), tsp, tbsp, or cup (for cooking measurements)

                Examples:
                apple, 1, pc
                milk, 1000, ml
                sugar, 500, g
                olive oil, 1, tbsp

                Remember: Only respond with the item details in the specified format. Do not include any other text or explanations.
                `;
                const result: GenerateContentResult = await model.generateContent([prompt, imageInput]);

                // add result to database
                const resultArr = result.response.text().split(", ");
                // console.log('resultArr: ', resultArr)
                setItem({
                    name: resultArr[0],
                    quantity: parseInt(resultArr[1]),
                    unit: resultArr[2],
                })
            } catch (error) {
                console.error('Error generating content:', error);
                toast.error("Cannot identify object. Try again")
            }
        } else {
            console.error("Cannot identify object. Try again");
            toast.error("Cannot identify object. Try again")
        }
    };

    // Handle create pantry item
    const handleCreate = async () => {
        if (item.name === '' || item.quantity === 0 || item.unit === '') {
            console.log("INPUTS CANT BE EMPTY: ", item)
            toast.error("Inputs cannot be empty")
            setIsLoading(false)
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

            fetchPantry();
            toast.success("Item added successfully");
            closeDrawer();
        }
    }

    const closeDrawer = () => {
        drawerCloseRef.current?.click();
        setIsCameraOn(false)
    };

    return (
        <>
            <Drawer>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="font-medium" onClick={() => setIsCameraOn(true)}>Add with CameraAI</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader className="mt-2">
                            <DrawerTitle className="text-center">CameraAI</DrawerTitle>
                            <DrawerDescription className="text-center">Scan your item</DrawerDescription>
                            {/* Camera content */}
                            <div className="p-4 pb-0">
                                {isCameraOn && <Camera
                                    ref={camera}
                                    aspectRatio={4 / 3}
                                    facingMode="user"
                                    errorMessages={{
                                        noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                                        permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                                        switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
                                        canvas: 'Canvas is not supported.'

                                    }}
                                />}

                            </div>
                        </DrawerHeader>
                        <DrawerFooter>
                            {isLoading ?
                                (<>
                                    <Button disabled>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Scanning
                                    </Button>
                                </>
                                ) : (
                                    <>
                                        <Button onClick={handleTakePhoto}>Take Photo</Button>
                                    </>
                                )}

                            <DrawerClose asChild>
                                <Button variant="outline" ref={drawerCloseRef} onClick={() => setIsCameraOn(false)}>Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

        </>
    )
}

export default Webcam