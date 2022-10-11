import { AuthToken } from "./AuthMidddlewareTypes";

export interface IAuth{
    verifyIdToken(token: string): Promise<AuthToken|null>
}