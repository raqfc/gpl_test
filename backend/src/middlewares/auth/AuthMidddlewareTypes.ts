import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export type AuthToken = DecodedIdToken & {
    jw: TokenPermissions,
    // name: string, //userName
    // aud: string
    // user_id: string
    // exp: string
    // uid: string
}

export type TokenPermissions = {
    c: Map<String, String[]>//user company profiles
    type: UserTokenType
}

export type UserTokenType = {
    cli: boolean //if it's a client
    adm: boolean //if it's an admin
}

export type Rules = {
    [module: string]: ModuleRules
}

export type ModuleRules = {
    [action: string]: string[]//array of profiles that can perform
}