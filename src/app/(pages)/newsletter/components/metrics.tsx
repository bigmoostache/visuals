import { useState } from 'react';
import {MetricInterface} from "@/app/(pages)/newsletter/interfaces";

const MetricCard: React.FC<MetricInterface> = ({metric, value, unit, previous_value, previous_relative_time}) => {
    const change = value - previous_value;
    const isPositive = change >= 0;

    return (
        <div className="bg-white text-gray-900 p-4 rounded-lg shadow-md w-[23%]">
            <h3 className="text-xs text-gray-500 mb-1">{metric}</h3>
            <p className="text-xl font-bold mb-1">{value.toFixed(2)} {unit}</p>
            <p className={`text-lg ${isPositive ? 'text-primary-500' : 'text-secondary'} flex items-center`}>
                {isPositive ? <UpArrow/> : <DownArrow/>} {change.toFixed(2)}%
            </p>
            {previous_relative_time &&
                <p className="text-sm mb-1  text-gray-400">from {previous_relative_time}</p>
            }
        </div>

    );
};


const UpArrow: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16"
         height="16">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/>
    </svg>
);

const DownArrow: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16"
         height="16">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
    </svg>
);


export default MetricCard;
