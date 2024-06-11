// ******************************************************
// ********************  ARTICLE CARDS *******************
// ******************************************************
import PertinenceGauge from "@/app/(pages)/newsletter/components/pertinence-gauge";

import {ArticleInterface} from "@/app/(pages)/newsletter/interfaces";

const ArticleCard: React.FC<ArticleInterface> = ({
                                                     reference_id,
                                                     title,
                                                     pertinence_score,
                                                     analysis,
                                                     summary,
                                                     tags,
                                                     localization,
                                                     source,
                                                     author,
                                                     sentiment,
                                                     image,
                                                     url
                                                 }) => (
    <div id={reference_id} className="flex bg-white shadow-md rounded-md mb-2 p-4">
        {image && (
            <img
                src={`data:image/jpeg;base64,${image.substring(11)}`}
                alt="Article"
                className="w-48 h-48 object-cover rounded mr-4"
                style={{width: '200px', height: '200px'}}
            />
        )}
        <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <h3 className="text-xl font-semibold mr-2">{title}</h3>
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                           className="text-blue-400 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" width="25" height="25">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M10 13a5 5 0 1 0 7-7l-1.5 1.5a3 3 0 1 1-4 4l-1.5 1.5zM14 10a5 5 0 1 0-7 7l1.5-1.5a3 3 0 1 1 4-4l1.5-1.5z"/>
                            </svg>
                        </a>
                    )}
                </div>
                <span
                    className={`px-2 py-0.5 rounded text-sm ${sentiment === 'positive' ? 'bg-primary text-primary-800' : sentiment === 'negative' ? 'bg-secondary-200 text-secondary-800' : 'bg-tertiary text-gray-600'}`}>
                    {sentiment === 'positive' ? 'Positive' : sentiment === 'negative' ? 'Negative' : 'Neutral'}
                </span>
            </div>
            <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600">{source} ({localization}) - {author}</p>
                <PertinenceGauge score={pertinence_score}/>
            </div>
            <hr className="mb-4"/>
            <p className="text-gray-700 mb-4">{summary}</p>
            <ul className="list-disc pl-5 text-gray-700 mb-4">
                {analysis.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    </div>
);

export default ArticleCard;
