"use client";
import BiblioArticle from "@/app/(pages)/biblio/components/BiblioArticle";
import FilterBar from "@/app/(pages)/biblio/components/FilterBar";
import {BiblioProvider, useBiblio} from '@/app/(pages)/biblio/contexts/BiblioContext';
import ArticleStatistics from "@/app/(pages)/biblio/components/ArticlesStatistics";
import SettingsIcon from "@/app/utils/project-manager/SettingsIcon";
import { changeHasPdf } from "@/app/utils/data-api/DataApi";


const BiblioContent = () => {
    const {
        biblio,
        filteredBiblio,
        setBiblio,
        handleFilterChange,
        handleSort,
        sortState,
        handleIncludeChange,
        handleHasPdfChange,
        handleUpdateBiblio
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

    const downloadPdf  =async ()=>{
        await Promise.all(biblio.filter(a => a.DO_INCLUDE).map(async a=>{
           //if(a.hasPdf) {return}

           //const url=`https://tools.blends.fr/scihub_dl/get-pdf/?doi=${a.DOI||a.doi}`           
           const url=`http://127.0.0.1:5000/get-pdf?doi=${a.DOI||a.doi}`
           

           const response = await fetch(url)

           if (!response.ok) {
                a.hasPdf=false
                return
            }

            // Convertir la réponse en Blob
            const blob = await response.blob();

            // Créer une URL pour ce Blob
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${(a.DOI||a.doi).replaceAll('/','@')}.pdf`; // Nom du fichier qui sera enregistré

            // Simuler un clic pour déclencher le téléchargement
            document.body.appendChild(link);
            link.click();

            // Nettoyer
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
            a.hasPdf=true
            await changeHasPdf(a.DOI||a.doi, true)            
        }))
       
    }

    const handleProjectSelect = (project: any) => {
        console.log("Projet sélectionné:", project.project_id);        
        
      };

    const handleFileUpload = (file:File)=>{
        if(file.name.endsWith('.jsonl')){
            const reader = new FileReader();
        
            reader.onload = (e:any) => {
              const lines = e.target.result.split('\n')
              handleUpdateBiblio(lines.map((l:string)=>JSON.parse(l)))
            };
            reader.readAsText(file); // Lire le fichier comme texte
        }
        
    }

    return (
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
             <SettingsIcon onProjectSelect={handleProjectSelect} onFileUploaded={handleFileUpload}/>
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
                        className="mb-4 mr-2 p-1 bg-secondary text-white text-xs h-[25px] rounded"
                        onClick={() => downloadBiblio(true)}
                    >
                        Download Selected
                    </button>
                    <button
                        className="mb-4 p-1 bg-tertiary text-white text-xs h-[25px] rounded"
                        onClick={() => downloadPdf()}
                    >
                        Download Selected PDF
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
                    onToggleHasPdf={handleHasPdfChange}
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
