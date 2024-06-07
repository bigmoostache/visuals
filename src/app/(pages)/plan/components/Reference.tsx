import React from 'react';

interface ReferenceCardProps {
    reference: Reference;
    sources: Source[];
}

const ReferenceCard: React.FC<ReferenceCardProps> = ({ reference, sources }) => {
    const source = sources.find(src => src.id === reference.source_id);
    const content = source ? source.full_text.substring(reference.start, reference.end) : '';

    return (
        <div className="p-2 bg-gray-100 rounded-md mb-2">
            <h4 className="text-lg font-semibold mb-1">
                <a href={`#source-${reference.source_id}`} className="text-blue-500 underline">
                    {reference.source_id}
                </a>
            </h4>
            <p>{content}</p>
        </div>
    );
};

export default ReferenceCard;
