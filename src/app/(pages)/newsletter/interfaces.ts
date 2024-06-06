
export interface EntryInterface {
    title: string;
    analysis: string;
    reference_id: string;
}

export interface SummaryItemInterface {
    title: string;
    entries: EntryInterface[];
}

export interface ArticleInterface {
    reference_id: string;
    title: string;
    pertinence_score: number;
    analysis: string[];
    summary: string;
    complete_entry: string;
    tags: string[];
    localization: string;
    source: string;
    author: string;
    sentiment: string;
}

export interface MetricInterface {
    metric: string;
    value: number;
    unit: string;
    previous_value: number;
    previous_relative_time: string;
}

export interface NewsletterInterface {
    summary: SummaryItemInterface[];
    articles: ArticleInterface[];
    metrics: MetricInterface[];
    timestamp: string;
    summary_analysis: string;
}
