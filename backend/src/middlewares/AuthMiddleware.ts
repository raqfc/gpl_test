

import { auth } from "firebase-admin";
import Auth = auth.Auth;

type AuthToken = {
    name: string //userName
    jw:
}

type TokenPermissions = {
    c: Map<String, String[]>//user company profiles
    type: UserTokenType
}

type UserTokenType = {
    cli: boolean //if it's a client
    adm: boolean //if it's an admin
}

export class AuthMiddleware {
    mAuth: Auth
    constructor(auth: Auth) {
        this.mAuth = auth
    }



    middleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
        //info
        // console.log(`1. logInput resolve: ${resolve}`) //resolver
        // context.authToken
        const r = await this.mAuth.verifyIdToken(context.authToken)
        console.log("verifiedIdToken", r)
        console.log(`1. logInput info: ${info}`) //which function is being called
        const result = await resolve(root, args, context, info)
        console.log(`5. logInput`)
        return result
    }

    isAdmin(authContext: any): boolean {
        return false
    }
}