"use client";
import {useSearchParams} from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import {useEffect, useState} from 'react';
import {Suspense} from 'react';


import {
    ArticleInterface,
    MetricInterface,
    NewsletterInterface,
    SummaryItemInterface
} from "@/app/(pages)/newsletter/interfaces";

// ******************************************************
// ******************  SUMMARY CARDS ********************
// ******************************************************
const SummaryCard: React.FC<SummaryItemInterface> = ({title, entries}) => (
    <div className="p-4 bg-white shadow-md rounded-md mb-4 w-full">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <ul className="list-disc pl-20 text-gray-700">
            {entries.map((entry) => (
                <li key={entry.reference_id}>
                    <strong><a href={`#${entry.reference_id}`} className="underline ml-1">{entry.title} </a>:</strong>

                    {entry.analysis}

                </li>
            ))}
        </ul>
    </div>
);

// ******************************************************
// ********************  METRIC CARDS *******************
// ******************************************************
const MetricCard: React.FC<MetricInterface> = ({metric, value, unit, previous_value, previous_relative_time}) => {
    const change = value - previous_value;
    const isPositive = change >= 0;

    return (
        <div className="bg-white text-gray-900 p-4 rounded-lg shadow-md">
            <h3 className="text-sm text-gray-500 mb-1">{metric}</h3>
            <p className="text-2xl font-bold mb-1">{value.toFixed(2)} {unit}</p>
            <p className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                {isPositive ? <UpArrow/> : <DownArrow/>} {change.toFixed(2)}%
            </p>
            <p className="text-sm mb-1  text-gray-400">from {previous_relative_time}</p>
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

// ******************************************************
// *****************  PERTINENCE SCORE  *****************
// ******************************************************
const PertinenceGauge: React.FC<{ score: number }> = ({ score }) => {
    // Determine the fill based on the score (0 to 1, where 1 is fully filled)
    const fillPercentage = (score / 10) * 100;

    // Calculate the color gradient from red to green
    const red = Math.max(0, 255 - (score * 25.5));
    const green = Math.min(255, score * 25.5);
    const color = `rgb(${red},${green},0)`;

    return (
        <div className="relative flex items-center justify-center w-[25px]">
            <svg width="24" height="24" viewBox="0 0 36 36" className="circular-chart absolute">
                <path
                    className="circle-bg"
                    d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="4"
                />
                <path
                    className="circle"
                    strokeDasharray={`${fillPercentage}, 100`}
                    d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
            <div className=" text-gray-700 text-sm font-bold">{score}</div>
        </div>
    );
};



// ******************************************************
// ********************  ARTICLE CARDS *******************
// ******************************************************
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
                    className={`px-2 py-0.5 rounded text-sm ${sentiment === 'positive' ? 'bg-green-200 text-green-800' : sentiment === 'negative' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
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

const Newsletter = () => {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const {data} = useGetFile({fetchUrl: url as string});
    const [text, setText] = useState<string>('');
    const [jsonNL, setJsonNL] = useState<NewsletterInterface>();
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);

    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            console.log(e.target?.result)
            setJsonNL(JSON.parse(e.target?.result as string) as NewsletterInterface);
        }
        reader.readAsText(data);
    }, [data]);

    const convertBackToFile = (text: string) => {
        const blob = new Blob([text], {type: 'text/plain'});
        return new File([blob], 'filename.txt', {lastModified: Date.now(), type: blob.type});
    }

    const {mutate, isLoading, isSuccess} = usePatchFile(
        {fetchUrl: url as string}
    );

    const onSubmit = async () => {
        console.log('submit');
        setUpdatableAgain(false);
        mutate(convertBackToFile(text));
    }

    return (
        jsonNL &&
        <div className="max-w-[60rem] mx-auto p-4 bg-white">
            <div className="mb-2">
                <img
                    src="https://images.unsplash.com/photo-1516689948391-3379ec7c7df0?q=80&w=1974&h=450&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
            </div>
            <div className="text-right text-gray-600 mb-6">
                {new Date(jsonNL.timestamp).toLocaleDateString()}
            </div>
            <div className="bg-gray-100 p-4 rounded-lg mb-8">
                <p className="text-gray-700">{jsonNL.summary_analysis}</p>
            </div>
            <h2 className="text-2xl font-bold mt-8 mb-4">Metrics</h2>
            <div className="metrics-section flex gap-4 mb-4">
                {jsonNL!.metrics.map((metric) => (
                    <MetricCard key={metric.metric} {...metric} />
                ))}
            </div>
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <div className="summary-section mb-8">
                {jsonNL.summary.map((summaryItem) => (
                    <SummaryCard key={summaryItem.title} {...summaryItem} />
                ))}
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">Articles</h2>
            <div className="articlesSection grid grid-cols-1 gap-2">
                {jsonNL.articles.map((article) => (
                    <ArticleCard key={article.reference_id} {...article} />
                ))}
            </div>
        </div>
    );
}

const NewsletterPage = () => {
    return (
        <Suspense>
            <Newsletter/>
        </Suspense>
    )
}

export default NewsletterPage;
