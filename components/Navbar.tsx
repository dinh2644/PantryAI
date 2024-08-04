"use client"

import React, { useState } from "react"
import Link from 'next/link'
import { Menu, Search } from "lucide-react"
import Webcam from "@/components/Webcam"
import Profile from "./Profile"


const Navbar = () => {
    const [state, setState] = useState(false)

    return (
        <nav className="bg-white w-full border-b md:border-0 fixed">

            <div className="items-center px-4 max-w-screen-xl mx-auto md:flex md:px-8 md:justify-between ">

                {/* Logo */}
                <div className="flex items-center justify-between py-3 md:py-5 md:block">
                    <Link href="/">
                        <h1 className="text-3xl font-bold text-black">PantryAI</h1>
                    </Link>
                    <div className="md:hidden">
                        <button
                            className="text-gray-700 outline-none p-2 rounded-md focus:border-gray-400 focus:border"
                            onClick={() => setState(!state)}
                        >
                            <Menu />
                        </button>
                    </div>
                </div>

                {/* Nav items */}
                <div
                    className={`flex justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${state ? "block" : "hidden"
                        }`}
                >
                    <ul className="justify-center items-start md:items-center space-y-8 flex flex-col md:flex-row md:space-x-6 md:space-y-0">

                        <Link href="/recipe" className=" text-gray-600 font-medium">Generate Recipe</Link>
                        <Webcam />
                        <Profile />
                    </ul>
                </div>


            </div>
        </nav>
    )
}

export default Navbar