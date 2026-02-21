export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    numberOfElements: number;
    sort?: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
}

export interface PageableParams {
    page?: number;
    size?: number;
    sort?: string;
}