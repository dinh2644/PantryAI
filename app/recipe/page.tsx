'use client'
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import Navbar from "@/components/Navbar";
import { usePantry } from '../supabase/PantryContext';


type Ingredient = string;
type Instruction = string;
type Tip = string;

interface Recipe {
    title?: string;
    ingredients?: Ingredient[];
    instructions?: Instruction[];
    tips?: Tip[];
    text: string;
    role: string;
    timestamp: Date;
}


const Recipe = () => {
    const [chatSession, setChatSession] = useState<any>(null);
    // const [userInput, setUserInput] = useState<PantryItem[]>(pantry)
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const { pantry } = usePantry();
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


    const parseRecipe = (text: string): Recipe => {
        const recipe: Recipe = {
            text,
            role: 'bot',
            timestamp: new Date()
        };

        const titleMatch = text.match(/Title:\s*(.*)/);
        if (titleMatch) recipe.title = titleMatch[1].trim().replace(/\*\*/g, '');

        const ingredientsMatch = text.match(/Ingredients:([\s\S]*?)(?=Instructions:|$)/);
        if (ingredientsMatch) recipe.ingredients = ingredientsMatch[1]
            .split('\n')
            .filter(i => i.trim() && !i.trim().match(/^[•\-\*]\s*\**\s*$/))
            .map(i => i.trim().replace(/^[•\-\*]\s*\**\s*/, '').replace(/\*\*/g, ''));

        const instructionsMatch = text.match(/Instructions:([\s\S]*?)(?=Tips:|$)/);
        if (instructionsMatch) recipe.instructions = instructionsMatch[1]
            .split('\n')
            .filter(i => i.trim() && !i.trim().match(/^(\d+\.|\*\*)\s*$/))
            .map(i => i.trim().replace(/^(\d+\.|\*\*)\s*/, '').replace(/\*\*/g, ''));

        const tipsMatch = text.match(/Tips:([\s\S]*?)$/);
        if (tipsMatch) recipe.tips = tipsMatch[1]
            .split('\n')
            .filter(i => i.trim() && !i.trim().match(/^[•\-\*]\s*\**\s*$/))
            .map(i => i.trim().replace(/^[•\-\*]\s*\**\s*/, '').replace(/\*\*/g, ''));

        return recipe;
    };

    const handleSendMessage = async () => {
        setLoading(true);
        try {
            if (chatSession) {
                if (pantry.length > 0) {
                    const pantryString = pantry.map(item =>
                        `${item.name}: ${item.quantity} ${item.unit}`
                    ).join(', ');
                    const prompt = `Given these pantry items: ${pantryString}, please generate an original, creative recipe. Do not reproduce any existing recipes. The recipe should be unique and based on combining the given ingredients in a novel way. Format the response as follows:
                                    Title: [Recipe Title]
                                    Ingredients:
                                    - [Ingredient 1]
                                    - [Ingredient 2]
                                    ...
                                    Instructions:
                                    1. [Step 1]
                                    2. [Step 2]
                                    ...
                                    Tips (optional):
                                    - [Tip 1]
                                    - [Tip 2]
                                    ...`;
                    if (prompt.trim() !== '') {
                        const result = await chatSession.sendMessage(prompt);
                        const responseText = result.response.text();
                        const parsedRecipe = parseRecipe(responseText);
                        setRecipe(parsedRecipe);
                    } else {
                        console.error("Prompt is empty");
                    }

                } else {
                    console.error("Pantry is empty");

                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    // Export recipe to PDF
    const downloadPDF = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        const doc = new jsPDF();
        if (recipe) {
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 10;
            const maxWidth = pageWidth - 2 * margin;

            // Split the recipe text into lines
            const lines = doc.splitTextToSize(recipe.text, maxWidth);

            // Set initial y position
            let yPosition = margin;

            // Add each line to the document
            lines.forEach((line: string) => {
                // Check if we need to start a new page
                if (yPosition > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(line, margin, yPosition);
                yPosition += 7; // Increment y position for next line
            });

            doc.save("recipe.pdf");
        }
    }
    console.log(pantry.length);

    return (
        <>
            <Navbar />
            <div className="py-20 px-10 sm:py-32 sm:px-16 md:p-28 lg:p-24 xl:p-40 bg-white rounded-lg w-full boxContainer min-h-screen flex flex-col justify-center items-center">
                {loading ? <Button disabled className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                </Button> : (
                    <>
                        {pantry && pantry.length > 2 ? (<Button
                            className={`bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300 ${recipe && 'hidden'} hover:scale-105 transform transition duration-y`}
                            onClick={handleSendMessage}
                        >
                            Generate Recipe
                        </Button>) : (
                            <Button
                                className={`bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300 ${recipe && 'hidden'}`}
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
                    <div className="flex flex-col mt-1">
                        <div className={`text-gray-600 mt-2 text-center ${recipe && 'hidden'}`}>
                            For best result, make sure your pantry has 3 or more appropiate items
                        </div>
                    </div>

                    {recipe &&
                        <div>
                            <Button className='bg-black mr-2' onClick={downloadPDF}>
                                Export PDF
                            </Button>
                            <Button variant="destructive" onClick={() => setRecipe(null)}>
                                Clear
                            </Button>
                        </div>}



                </div>


                {recipe && (
                    <div className="p-6 bg-gray-100 rounded-xl mt-4 shadow-md max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">{recipe.title}</h2>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Ingredients column */}
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">Ingredients:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {recipe.ingredients?.map((ingredient, index) => (
                                        <li key={index}>{ingredient}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions column */}
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">Instructions:</h3>
                                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                    {recipe.instructions?.map((step, index) => (
                                        <li key={index} className="mb-2">{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        {/* Tips row */}
                        {recipe.tips && recipe.tips.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">Tips:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {recipe.tips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>

    );
};

export default Recipe;