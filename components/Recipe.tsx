'use client'
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from '@google/generative-ai';
import { PantryItem } from '@/app/supabase/actions';
import { Loader2 } from "lucide-react"


interface RecipeProps {
    pantry: PantryItem[]
}

const Recipe = ({ pantry }: RecipeProps) => {
    const [chatSession, setChatSession] = useState<any>(null);
    // const [userInput, setUserInput] = useState<PantryItem[]>(pantry)
    const [recipe, setRecipe] = useState<{ text: string, role: string, timestamp: Date } | null>(null);
    const [loading, setLoading] = useState<boolean>(false)

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    const MODEL_NAME = "gemini-1.0-pro-001"

    const genAI = new GoogleGenerativeAI(API_KEY!);

    const generationConfig = {
        temperature: 0.9, // randomness of generation
        topK: 1, // controls filtering of possible tokens that can be generated
        topP: 1,
        maxOutputTokens: 530,
    }

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
    ];

    useEffect(() => {
        const initChat = async () => {
            try {
                const newChat = await genAI.getGenerativeModel({ model: MODEL_NAME }).startChat({
                    generationConfig,
                    safetySettings
                })
                setChatSession(newChat)
            } catch (error) {
                console.error(error);

            }
        }
        initChat();
    }, [])


    const handleSendMessage = async () => {
        setLoading(true)
        try {
            if (chatSession) {
                // Convert pantry items to a string
                const pantryString = pantry.map(item =>
                    `${item.name}: ${item.quantity} ${item.unit}`
                ).join(', ');

                const prompt = `Given these pantry items: ${pantryString}, please generate a recipe.`;

                const result = await chatSession.sendMessage(prompt);
                const botMessage = {
                    text: result.response.text(),
                    role: 'bot',
                    timestamp: new Date()
                };

                // Display to user
                setRecipe(botMessage);
                setLoading(false)
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className=" p-6 bg-white rounded-lg w-full boxContainer">
            {loading ? <Button disabled className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button> : (
                <>
                    {pantry && pantry.length > 0 ? (<Button
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300"
                        onClick={handleSendMessage}
                    >
                        Generate Recipe
                    </Button>) : (
                        <Button
                            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300"
                            onClick={handleSendMessage}
                            title="Must have food in pantry"
                            disabled
                        >
                            Generate Recipe
                        </Button>
                    )}

                </>
            )}


            <div className="flex justify-between items-center">
                <div className="text-gray-600 mt-2 ">
                    Note: Pantry must have items to generate a recipe
                </div>
                {recipe && <Button variant="destructive" onClick={() => setRecipe(null)}>
                    Clear
                </Button>}

            </div>


            {recipe && (
                <>
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 ">Instructions:</h3>
                        <div className="overflow-y-auto flex-grow mb-4 max-h-[calc(100vh-600px)]">
                            <pre className="whitespace-pre-wrap columns-2 p-3">{recipe.text}</pre>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default Recipe;