'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PantryItem, getPantry } from './actions';
import toast from "react-hot-toast";

interface PantryContextType {
    pantry: PantryItem[];
    fetchPantry: () => Promise<void>;
    isLoading: boolean;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pantry, setPantry] = useState<PantryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const fetchPantry = async () => {
        try {
            const { data, error } = await getPantry();
            if (error) {
                console.error("Error fetching pantry items:", error);
                toast.error("Failed to fetch pantry items");
                setPantry([]);
            } else if (data) {
                setPantry(data as PantryItem[]);
            } else {
                setPantry([]);
            }
        } catch (error) {
            console.error("Unexpected error fetching pantry items:", error);
            toast.error("An unexpected error occurred");
            setPantry([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPantry();
    }, []);

    return (
        <PantryContext.Provider value={{ pantry, fetchPantry, isLoading }}>
            {children}
        </PantryContext.Provider>
    );
};

export const usePantry = () => {
    const context = useContext(PantryContext);
    if (context === undefined) {
        throw new Error('usePantry must be used within a PantryProvider');
    }
    return context;
};