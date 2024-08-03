'use client'
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { PantryItem } from '@/app/supabase/actions';
import { Loader2 } from "lucide-react"
import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf"

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


    // Export recipe to PDF
    const downloadPDF = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        // const capture = document.querySelector('.pdfStart')
        // html2canvas(capture as HTMLElement).then((canvas) => {
        //     const imgData = canvas.toDataURL('img/png');
        //     const doc = new jsPDF('p', 'px', 'a4');
        //     const componentWidth = doc.internal.pageSize.getWidth();
        //     const componentHeight = doc.internal.pageSize.getHeight();
        //     doc.addImage(imgData, 'PNG', 0, 0, componentWidth, componentHeight);
        //     doc.save('recipe.pdf');
        // });

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



    return (
        <div className=" p-6 bg-white rounded-lg w-full boxContainer px-32">
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
                <>
                    <div className="p-4 bg-gray-100 rounded-lg mt-3">
                        <h3 className="text-lg font-semibold mb-2 ">Instructions:</h3>
                        <div className="overflow-y-auto flex-grow mb-4 max-h-[calc(100vh-600px)] ">
                            <pre className="whitespace-pre-wrap columns-2 p-3 pdfStart">{recipe.text}</pre>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default Recipe;