import React, { useState } from 'react';
import { Article } from '@/app/(pages)/biblio/interfaces';

interface ArticleCardProps {
    article: Article;
}

const BiblioArticle: React.FC<ArticleCardProps> = ({ article }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showScoreJustification, setShowScoreJustification] = useState(false);
    const [showFullAbstract, setShowFullAbstract] = useState(false);

    const abstract = article.abstract ||'';
    const shortAbstract = abstract.length > 300 ? abstract.slice(0, 300) + '...' : abstract;

    return (
        <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mb-4 p-6 bg-tertiary">
            <h2 className="text-xl font-bold mb-2 text-primary">{article.title}</h2>
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
                    <p><strong>Authors:</strong> {article.author?.map((a) => a.full).join(', ')}</p>
                    <p><strong>Publication Date:</strong> {article.publication_date}</p>
                    <p><strong>Type:</strong> {article.TYPE} ({article.TYPE_JUSTIFICATION})</p>
                    <p><strong>Methods:</strong> {article.METHODS}</p>
                    <p><strong>Key Points:</strong>
                        <ul className="ml-10 list-disc mb-2">
                        {article.KEY_POINTS?.map((k:string)=>(
                            <li key={k}>{k}</li>
                        ))}
                        </ul>
                    </p>
                    <p><strong>BKT:</strong> {article.BKT} ({article.BKT_JUSTIFICATION})</p>
                </div>
            )}
            <div className="mt-2">
                <p>
                    <strong>SCORE:</strong> {article.SCORE}
                    <button
                        onClick={() => setShowScoreJustification(!showScoreJustification)}
                        className="ml-2 text-secondary hover:underline"
                    >
                        {showScoreJustification ? 'Hide Justification' : 'Show Justification'}
                    </button>
                </p>
                {showScoreJustification && (
                    <p className="mt-2 text-gray-700">{article.SCORE_JUSTIFICATION}</p>
                )}
            </div>
        </div>
    );
};

export default BiblioArticle;
