export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName?: string;
    roles: string[];
    token?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Role {
    id: number;
    name: string;
}
