"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {useSearchParams} from "next/navigation";
import useGetFile from '@/app/(pages)/(hooks)/useGetFile';
import usePatchFile from '@/app/(pages)/(hooks)/usePatchFile';

interface PlanContextType {
    plan: PlanInterface | undefined;
    setPlan: React.Dispatch<React.SetStateAction<PlanInterface | undefined>>;
    updateFeedback: () => void;
    isLoading: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children}) => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    if(!url){throw "DATA URL NOT PROVIDED"}
    const [plan, setPlan] = useState<PlanInterface>();
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);

    // NO-CHANGE Retrieving BLOB
    const { data } = useGetFile({ fetchUrl: url });

    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            setPlan(JSON.parse(e.target?.result as string) as PlanInterface);
        };
        reader.readAsText(data);
    }, [data]);
// Local conversion local type -> blob
    const convertBackToFile = (text: string) => {
        const blob = new Blob([text], {type: 'text/plain'});
        return new File([blob], 'filename.txt', { lastModified: Date.now(), type: blob.type });
    }
    // NO-CHANGE Updating BLOB imports
    const { mutate, isLoading, isSuccess } = usePatchFile(
        {fetchUrl: url as string}
    );
    const updateFeedback = () => {
        //setUpdatableAgain(false);
        //mutate(convertBackToFile(JSON.stringify(plan)));
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
