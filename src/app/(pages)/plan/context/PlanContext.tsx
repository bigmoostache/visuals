"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {useSearchParams} from "next/navigation";
import useGetFile from '@/app/(pages)/(hooks)/useGetFile';


interface PlanContextType {
    plan: PlanInterface | undefined;
    setPlan: React.Dispatch<React.SetStateAction<PlanInterface | undefined>>;
    updateFeedback: (source_id: string, feedback: string) => void;
    isLoading: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children}) => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    if(!url){throw "DATA URL NOT PROVIDED"}
    const [plan, setPlan] = useState<PlanInterface>();
    // NO-CHANGE Retrieving BLOB
    const { data, isLoading } = useGetFile({ fetchUrl: url });

    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setPlan(JSON.parse(e.target?.result as string) as PlanInterface);
        };
        reader.readAsText(data);
    }, [data]);

    const updateFeedback = (source_id: string, feedback: string) => {
        setPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            const updatedPlan = { ...prevPlan };
            updatedPlan.figures = updatedPlan.figures.map(fig =>
                fig.source_id === source_id ? { ...fig, user_feedback: feedback } : fig
            );
            return updatedPlan;
        });
    };

    

    return (
        <PlanContext.Provider value={{ plan, setPlan, updateFeedback, isLoading }}>
            {children}
        </PlanContext.Provider>
    );
};

export const usePlan = () => {
    const context = useContext(PlanContext);
    if (!context) {
        throw new Error('usePlan must be used within a PlanProvider');
    }
    return context;
};
