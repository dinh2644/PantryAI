'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Camera } from "react-camera-pro";
import { Button } from '@/components//ui/button';
import WebcamLogo from "../../public/webcam.png"
import Image from 'next/image';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Buffer } from 'buffer';


const Webcam = () => {
    const [image, setImage] = useState<string | null>(null);
    const [numberOfCameras, setNumberOfCameras] = useState<number>(0);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
    const camera = useRef<any>(null);

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

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    const MODEL_NAME = "gemini-1.5-flash"
    const genAI = new GoogleGenerativeAI(API_KEY!);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const base64ToBuffer = (base64: string) => {
        const [, data] = base64.split(',');
        return Buffer.from(data, 'base64');
    };

    const generateContent = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (image) {
            try {
                // Convert base64 string to Buffer
                const imageBuffer = base64ToBuffer(image);
                const imageInput = {
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: "image/jpeg"
                    }
                } as const;
                const prompt = process.env.NEXT_PUBLIC_AI_PROMPT!;
                const result = await model.generateContent([prompt, imageInput]);
                alert(result.response.text());
            } catch (error) {
                console.error('Error generating content:', error);
            }
        } else {
            console.error('Image is not available');
        }
    };
    return (
        <>
            {/* Camera */}
            <div className="flex justify-center items-center min-h-screen">
                {/* WHEN CAM IS OFF */}
                {!isCameraOn ? (
                    <div className="flex justify-center items-center gap-8">
                        <div className='font-semibold text-2xl'>Upload to Pantry <br /> with CameraAI 👉</div>
                        <Image
                            src={WebcamLogo}
                            width={125}
                            height={125}
                            alt="Picture of the author"
                            onClick={() => { setIsCameraOn(true) }}
                            className='cursor-pointer hover:scale-110 transform transition duration-y'
                        />
                    </div>

                ) : (
                    <>
                        {/* WHEN CAM IS ON */}
                        <div className="w-1/2">
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
                        </div>

                        <Button onClick={() => { setIsCameraOn(false); setImage(null) }} className='my-1 bg-red-600'>'Turn Camera Off' </Button>
                        <Button onClick={handleTakePhoto} className='bg-gray-900 my-1'>Take Photo</Button>
                        {numberOfCameras > 1 && isCameraOn && (
                            <Button className='bg-gray-700 my-1' onClick={() => camera.current?.switchCamera()}>Switch Camera</Button>

                        )}
                        {image && <Button onClick={generateContent} className='bg-gray-500 my-1' >Add to pantry</Button>}

                        <div className="w-1/2">
                            {/* Tooken Photo */}
                            {image && <img src={image} alt='Taken photo' />}
                        </div>




                    </>
                )}


            </div >
        </>
    )
}

export default Webcam