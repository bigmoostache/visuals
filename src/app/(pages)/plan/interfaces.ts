interface Reference {
    source_id: string;
    start: number;
    end: number;
    comment: string;
    score: number; // sur 100
    user_frozen: boolean;
}

interface Source {
    id: string;
    title: string;
    full_text: string;
    citation: string;
    figures: Figure[];
    penalization_factor: number;
}

interface Figure {
    title: string;
    comment: string;
    source_id: string;
    source_is_internal: boolean;
    contents?: string; // base64 encoded string
    user_feedback?: string;
}

interface Section {
    title: string;
    title_feedback?: string; // If set, title will be iterated

    abstract: string;
    abstract_feedback?: string; // If set, abstract will be iterated

    themes: string[];
    themes_feedback?: string; // If set, themes will be iterated

    references: Reference[];
    references_feedback?: string; // If set, references will be recalculated

    redaction_directives?: string;
    full_text?: string;

    figures: Figure[];

    subsections_feedback: string; // BE CAREFUL, IF SET, WILL OVERWRITE THE SUBSECTIONS WITH A NEW AI-GENERATED PROPOSITION
    subsections: Section[];
}

interface PlanInterface {
    contents: Section;
    sources: Source[];
}
