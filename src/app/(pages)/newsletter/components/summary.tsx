import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {SummaryItemInterface} from "@/app/(pages)/newsletter/interfaces";  // Importing icons from react-icons

const SummaryCard: React.FC<SummaryItemInterface> = ({ title, entries }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-md mb-4 w-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-900 text-xl font-semibold">{title} <span className="text-xs">({entries.length} articles)</span></h3>
                <button onClick={toggleExpansion} className="focus:outline-none print:hidden">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>
            <ul className={`list-disc pl-20 text-gray-700 ${isExpanded ? '' : 'hidden'} print:block`}>
                {entries.map((entry) => (
                    <li key={entry.reference_id}>
                        <strong>
                            <a href={`#${entry.reference_id}`} className="underline ml-1">
                                {entry.title}
                            </a>
                            :
                        </strong>
                        {entry.analysis}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SummaryCard;
