interface Author {
    affiliation: string[];
    full: string;
    first: boolean;
}

interface Article {
    DOI: string;
    abstract: string;
    title: string;
    author?: Author[];
    publication_date: string;
    SCORE: number;
    SCORE_JUSTIFICATION: string;
    TYPE_JUSTIFICATION: string;
    TYPE: string;
    METHODS: string;
    KEY_POINTS?: string[];
    BKT_JUSTIFICATION: string;
    BKT: string;
    INCLUDE_SCORE: number;
    INCLUDE_JUSTIFICATION: string;
    DO_INCLUDE?:boolean
}
