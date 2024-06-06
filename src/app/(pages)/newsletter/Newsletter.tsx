"use client";
import {useSearchParams} from 'next/navigation'
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import {useEffect, useState} from 'react'
import {Suspense} from 'react'
import styles from './newsletter.module.css';
import {
    ArticleInterface,
    MetricInterface,
    NewsletterInterface, SummaryItemInterface
} from "@/app/(pages)/newsletter/interfaces";


// ******************************************************
// ******************  SUMMARY CARDS ********************
// ******************************************************
const SummaryCard: React.FC<SummaryItemInterface> = ({title, entries}) => (
    <div className="p-4 bg-white shadow-md rounded-md mb-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {entries.map((entry) => (
            <p key={entry.reference_id} className="text-gray-700">
                <strong>{entry.title}:</strong> {entry.analysis}
            </p>
        ))}
    </div>
);


// ******************************************************
// ********************  METRIC CARDS *******************
// ******************************************************

const MetricCard: React.FC<MetricInterface> = ({metric, value, previous_value}) => {
    const change = value - previous_value;
    const isPositive = change > 0;

    return (
        <div className="p-4 bg-white shadow-md rounded-md mb-4">
            <h3 className="text-xl font-semibold mb-2">{metric}</h3>
            <p className={`text-${isPositive ? 'green' : 'red'}-600`}>
                <strong>{value}</strong> {isPositive ? <UpArrow /> : <DownArrow />}
            </p>
        </div>
    );
};

const UpArrow: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="none" d="M0 0h24v24H0z"/>
        <path d="M12 17.27L18.18 24l-1.64-7.03L22 9H2v8.27l5.46 4.73L12 17.27z"/>
    </svg>
);

const DownArrow: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="none" d="M0 0h24v24H0z"/>
        <path d="M12 7.27L18.18 0l-1.64 7.03L22 15H2v-8.27l5.46 4.73L12 7.27z"/>
    </svg>
);

// ******************************************************
// ********************  ARTICLE CARDS *******************
// ******************************************************

const ArticleCard: React.FC<ArticleInterface> = ({
                                                     title,
                                                     pertinence_score,
                                                     analysis,
                                                     summary,
                                                     tags,
                                                     localization,
                                                     source,
                                                     author,
                                                     sentiment,
                                                 }) => (
    <div className="p-4 bg-white shadow-md rounded-md mb-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-700">Pertinence score: {pertinence_score}</p>
        <ul className="list-disc pl-5 text-gray-700 mb-2">
            {analysis.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
        <p className="text-gray-700 mb-2">{summary}</p>
        <p className="text-gray-700 mb-2">
            Tags:
            {tags.map((item, index) => (
                <span key={index} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-2">
                    {item}
                </span>
            ))}
        </p>
        <p className="text-gray-700 mb-2">Localization: {localization}</p>
        <p className="text-gray-700 mb-2">Source: {source}</p>
        <p className="text-gray-700 mb-2">Author: {author}</p>
        <p className="text-gray-700 mb-2">Sentiment: {sentiment}</p>
    </div>
);


const Newsletter = () => {
    // NO-CHANGE Retrieving URL
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    // NO-CHANGE Retrieving BLOB
    const {data} = useGetFile({fetchUrl: url as string})
    // Local states, you may modify this for other types
    const [text, setText] = useState<string>('');
    const [jsonNL, setJsonNL] = useState<NewsletterInterface>();
    const [updatable, setUpdatable] = useState<boolean>(false);
    const [updatableAgain, setUpdatableAgain] = useState<boolean>(false);
    // Local conversion blob -> local type
    useEffect(() => {
        if (!data) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            console.log(e.target?.result)
            setJsonNL(JSON.parse(e.target?.result as string) as NewsletterInterface);
        }
        reader.readAsText(data);
    }, [data]);
    // Local conversion local type -> blob
    const convertBackToFile = (text: string) => {
        const blob = new Blob([text], {type: 'text/plain'});
        return new File([blob], 'filename.txt', {lastModified: Date.now(), type: blob.type});
    }
    // NO-CHANGE Updating BLOB imports
    const {mutate, isLoading, isSuccess} = usePatchFile(
        {fetchUrl: url as string}
    );
    // Updating BLOB local logic (especially, onSuccess)
    const onSubmit = async () => {
        console.log('submit');
        setUpdatableAgain(false);
        mutate(convertBackToFile(text));
    }

    return (
        jsonNL &&
        <div className="max-w-7xl mx-auto p-4">
            <div className="summary-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jsonNL!.summary.map((summaryItem) => (
                    <SummaryCard key={summaryItem.title} {...summaryItem} />
                ))}
            </div>
            <div className="metrics-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {jsonNL!.metrics.map((metric) => (
                    <MetricCard key={metric.metric} {...metric} />
                ))}
            </div>
            <div className="articlesSection grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {jsonNL!.articles.map((article) => (
                    <ArticleCard key={article.reference_id} {...article} />
                ))}
            </div>
        </div>
    );
}

const NewsletterPage = () => {
    return (
        // You could have a loading skeleton as the `fallback` too
        <Suspense>
            <Newsletter/>
        </Suspense>
    )
}

export default NewsletterPage;
