export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    preferences: string[];
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ISignupRequest {
    name: string;
    email: string;
    password: string;
    preferences?: string[];
}

export interface IUpdatePreferencesRequest {
    preferences: string[];
}

export interface IAuthResponse {
    token: string;
    user?: IUser;
}

export interface INewsItem {
    _id?: string;
    title: string;
    description: string;
    category: string;
    publishedAt?: Date;
}

export interface INewsResponse {
    news: INewsItem[];
}

export interface IPreferencesResponse {
    preferences: string[];
}

