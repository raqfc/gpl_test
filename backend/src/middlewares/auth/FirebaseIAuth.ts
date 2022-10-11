import { IAuth } from "./IAuth";
import { AuthToken } from "./AuthMidddlewareTypes";

import { auth } from "firebase-admin";
import Auth = auth.Auth;


export class FirebaseIAuth implements IAuth{
    mAuth: Auth
    constructor(mAuth: Auth) {
        this.mAuth = mAuth
    }

    async verifyIdToken(token: string): Promise<AuthToken | null> {
        if (token) {
            try {
                return (await this.mAuth.verifyIdToken(token)) as unknown as AuthToken
            } catch (e) {
                console.log("Error parsing authToken")
                console.log("e ", e)
            }
        }
        return null
    }
}