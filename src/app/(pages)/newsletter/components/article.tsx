// ******************************************************
// ********************  ARTICLE CARDS *******************
// ******************************************************
import PertinenceGauge from "@/app/(pages)/newsletter/components/pertinence-gauge";

import {ArticleInterface} from "@/app/(pages)/newsletter/interfaces";
import {FaLink} from "react-icons/fa";

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
        {
            image?.substring(11) ? (
            <img
                src={`data:image/jpeg;base64,${image.substring(11)}`}
                alt="Article"
                className="w-48 h-48 object-cover rounded mr-4"
                style={{width: '200px', height: '200px'}}
            />
            ): image ? (
                <img
                    src="https://images.unsplash.com/photo-1516689948391-3379ec7c7df0?q=80&w=450&h=450&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Article"
                    className="w-48 h-48 object-cover rounded mr-4"
                    style={{width: '200px', height: '200px'}}
                />
            ):null
        }
        <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <h3 className="text-xl font-semibold mr-2">{title}</h3>
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                           className="text-blue-400 hover:text-gray-700">
                           <FaLink className="mr-2"></FaLink>
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
