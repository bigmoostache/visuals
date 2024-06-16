import React, {useState} from 'react';
// @ts-ignore
import {Article} from '@/app/(pages)/biblio/interfaces';
import {FaCircleCheck, FaRegCircle} from "react-icons/fa6";
import {FaLink} from "react-icons/fa";

interface ArticleCardProps {
    article: Article;
    isIncluded: boolean;
    onIncludeChange: (DOI: string) => void;
}

const BiblioArticle: React.FC<ArticleCardProps> = ({article, isIncluded, onIncludeChange}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showFullAbstract, setShowFullAbstract] = useState(false);
    const [tooltip, setTooltip] = useState('');

    const abstract = article.abstract || '';
    const shortAbstract = abstract.length > 300 ? abstract.slice(0, 300) + '...' : abstract;

    const showTooltip = (field?: string) => {
        setTooltip(field ? article[field] : '')
    }
    return (
        <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mb-4 p-6 bg-tertiary">
            <div className="flex items-center  mb-2">
                <div className="w-[30px] flex-shrink-0 mr-2 text-xl text-secondary-800">
                    {isIncluded ? (
                        <FaCircleCheck onClick={() => onIncludeChange(article.DOI)}/>
                    ) : (
                        <FaRegCircle onClick={() => onIncludeChange(article.DOI)}/>
                    )}
                </div>
                <h2 className="text-xl font-bold text-primary flex-1">{article.title}</h2>
                <div className="w-[30px] flex-shrink-0 mr-2 text-xl text-primary cursor-pointer">
                    <a href={`https://doi.org/${article.DOI}`} target="_blank"><FaLink></FaLink></a>
                </div>
            </div>
            <p className="text-gray-700 mb-2">
                {showFullAbstract ? abstract : shortAbstract}
                {abstract.length > 300 && (
                    <button
                        onClick={() => setShowFullAbstract(!showFullAbstract)}
                        className="text-secondary hover:underline ml-2"
                    >
                        {showFullAbstract ? 'Less' : 'More'}
                    </button>
                )}
            </p>
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-secondary hover:underline"
            >
                {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            {showDetails && (
                <div className="mt-2 text-primary">
                    <p><strong>DOI:</strong> {article.DOI}</p>
                    <p><strong>Authors:</strong> {article.author?.map((a: Author) => a.full).join(', ')}</p>
                    <p><strong>Publication Date:</strong> {article.publication_date}</p>
                    <p><strong>Type:</strong> {article.TYPE} ({article.TYPE_JUSTIFICATION})</p>
                    <p><strong>Methods:</strong> {article.METHODS}</p>
                    <p><strong>Key Points:</strong>
                        <ul className="ml-10 list-disc mb-2">
                            {article.KEY_POINTS?.map((k: string) => (
                                <li key={k}>{k}</li>
                            ))}
                        </ul>
                    </p>
                    <p><strong>BKT:</strong> {article.BKT} ({article.BKT_JUSTIFICATION})</p>
                </div>
            )}
            <div className="mt-2">
                <div className="flex justify-between">
                    <div className="inline whitespace-nowrap"
                         onMouseOver={() => showTooltip("SCORE_JUSTIFICATION")}
                         onMouseLeave={() => showTooltip()}>
                        <strong>TOPIC SCORE:</strong> {article.SCORE}
                    </div>
                    <div className="text-secondary text-sm px-2">{tooltip}</div>
                    <div className="inline  whitespace-nowrap"
                         onMouseOver={() => showTooltip("INCLUDE_JUSTIFICATION")}
                         onMouseLeave={() => showTooltip()}>
                        <strong>INCLUDE SCORE:</strong> {article.INCLUDE_SCORE}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BiblioArticle;
