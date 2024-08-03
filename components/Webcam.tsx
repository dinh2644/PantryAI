'use client'
import React, { useRef, useState } from 'react'
import { Camera } from "react-camera-pro";
import { Button } from './ui/button';
import WebcamLogo from "../public/webcam.png"
import Image from 'next/image';

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

    return (
        <>
            {/* Camera */}
            <div className="flex overflow-y-auto flex-grow justify-center items-center py-2 max-h-[calc(100vh-450px)] px-64 bg-white rounded-lg w-full min-h-64 boxContainer">
                <div className='flex flex-col w-80'>
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
                        // <div style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                        //     Camera is off
                        // </div>
                        <div className='font-semibold text-2xl'>Upload to Pantry with CameraAI 👉</div>
                    )}
                </div>

                <div className="flex flex-col px-4">
                    {/* Camera buttons */}
                    {!isCameraOn ?
                        <Image
                            src={WebcamLogo}
                            width={100}
                            height={100}
                            alt="Picture of the author"
                            onClick={() => { setIsCameraOn(!isCameraOn) }}
                            className='cursor-pointer'
                        /> : <Button onClick={() => { setIsCameraOn(!isCameraOn); setImage(null) }} className='my-1 bg-red-600'>'Turn Camera Off' </Button>}

                    {isCameraOn && <Button onClick={handleTakePhoto} className='bg-gray-900 my-1'>Take Photo</Button>}
                    {numberOfCameras > 1 && isCameraOn && (
                        <Button className='bg-gray-700 my-1' onClick={() => camera.current?.switchCamera()}>Switch Camera</Button>
                    )}
                    {image && <Button className='bg-gray-500 my-1' >Add to pantry</Button>}
                </div>
                {image && <img src={image} alt='Taken photo' className='w-80' />}
            </div>
        </>
    )
}

export default Webcam