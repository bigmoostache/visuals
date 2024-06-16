import React, { useMemo } from 'react';
// @ts-ignore
import { Article } from '@/app/(pages)/biblio/interfaces';
import { useBiblio } from '@/app/(pages)/biblio/contexts/BiblioContext';

const ArticleStatistics: React.FC = () => {
    const { biblio } = useBiblio();

    // Filtrer les articles inclus
    const includedArticles = useMemo(() => biblio.filter((article:Article) => article.DO_INCLUDE), [biblio]);

    // Fonction pour compter les articles par type
    const countByType = useMemo(() => {
        return includedArticles.reduce((acc:any, article:Article) => {
            acc[article.TYPE] = (acc[article.TYPE] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
    }, [includedArticles]);

    // Fonction pour compter les articles par BKT
    const countByBKT = useMemo(() => {
        return includedArticles.reduce((acc:any, article:Article) => {
            acc[article.BKT] = (acc[article.BKT] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
    }, [includedArticles]);

    // Fonction pour compter les articles par année de publication
    const countByYear = useMemo(() => {
        return includedArticles.reduce((acc:any, article:Article) => {
            const year = new Date(article.publication_date).getFullYear();
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {} as { [key: number]: number });
    }, [includedArticles]);

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 mt-4 fixed top-0 left-0 ml-2">
            <h2 className="text-2xl font-bold text-primary mb-4">Selected Article : {includedArticles.length}</h2>
            <div>
                <h3 className="text-xl font-semibold">Articles by Type</h3>
                <ul className="list-disc ml-6 mb-4">
                    {Object.entries(countByType).map(([type, count]) => (
                        <li key={type}>{type}: {count}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="text-xl font-semibold">Articles by BKT</h3>
                <ul className="list-disc ml-6 mb-4">
                    {Object.entries(countByBKT).map(([bkt, count]) => (
                        <li key={bkt}>{bkt}: {count}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="text-xl font-semibold">Articles by Publication Year</h3>
                <ul className="list-disc ml-6 mb-4">
                    {Object.entries(countByYear).map(([year, count]) => (
                        <li key={year}>{year}: {count}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ArticleStatistics;
