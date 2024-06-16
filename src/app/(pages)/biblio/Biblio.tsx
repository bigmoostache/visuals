"use client";
import BiblioArticle from "@/app/(pages)/biblio/components/BiblioArticle";
import FilterBar from "@/app/(pages)/biblio/components/FilterBar";
import {BiblioProvider, useBiblio} from '@/app/(pages)/biblio/contexts/BiblioContext';
import ArticleStatistics from "@/app/(pages)/biblio/components/ArticlesStatistics";

const BiblioContent = () => {
    const {
        biblio,
        filteredBiblio,
        setBiblio,
        handleFilterChange,
        handleSort,
        sortState,
        handleIncludeChange,
    } = useBiblio();

    const downloadBiblio = (onlyIncluded?: boolean) => {
        let articlesToDld = biblio
        if (onlyIncluded) {
            articlesToDld = biblio.filter(a => a.DO_INCLUDE)
        }
        const biblioString = articlesToDld.map(article => JSON.stringify(article)).join('\n');
        const blob = new Blob([biblioString], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = onlyIncluded ? 'biblio-included.jsonl' : 'biblio.jsonl';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
            <ArticleStatistics />
            <div className="flex justify-between">
                <h1 className="text-3xl font-bold mb-4 text-primary">Articles</h1>
                <div className="inline">
                    <button
                        className="mb-4 mr-2 p-1 bg-primary text-white text-xs h-[25px] rounded"
                        onClick={() => downloadBiblio()}
                    >
                        Download Biblio
                    </button>
                    <button
                        className="mb-4 p-1 bg-secondary text-white text-xs h-[25px] rounded"
                        onClick={() => downloadBiblio(true)}
                    >
                        Download Selected
                    </button>
                </div>
            </div>

            <FilterBar
                //articles={biblio}
                //filteredArticles={filteredBiblio}
                //onFilterChange={handleFilterChange}
                //onSort={handleSort}
                //sortState={sortState}
            />

            {filteredBiblio.map((article, index) => (
                <BiblioArticle
                    key={index}
                    article={article}
                    isIncluded={article.DO_INCLUDE ?? false}
                    onIncludeChange={handleIncludeChange}
                />
            ))}
        </div>
    );
};

const Biblio = () => {
    return (
        <BiblioProvider>
            <BiblioContent/>
        </BiblioProvider>
    );
};

export default Biblio;
