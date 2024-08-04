'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './client';
import { PantryItem } from './supabase/actions';
import toast from "react-hot-toast";

interface PantryContextType {
    pantry: PantryItem[];
    fetchPantry: () => Promise<PantryItem[]>;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pantry, setPantry] = useState<PantryItem[]>([]);

    const fetchPantry = async () => {
        const { data, error } = await supabase
            .from("pantry")
            .select()
            .order("quantity", { ascending: false });

        if (error) {
            console.error("Error fetching pantry items:", error);
            toast.error("Failed to fetch pantry items");
            return [];
        }

        if (data) {
            setPantry(data as PantryItem[]);
            return data;
        } else {
            setPantry([]);
            return [];
        }
    };

    useEffect(() => {
        fetchPantry();
    }, []);

    return (
        <PantryContext.Provider value={{ pantry, fetchPantry }}>
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