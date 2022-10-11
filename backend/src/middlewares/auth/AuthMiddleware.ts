import { auth } from "firebase-admin";
import { ACCESS_ACTION, ACCESS_MODULE, AuthToken, RequiredPermissions, TokenPermissions } from "./AuthMidddlewareTypes";
import { fieldNameToTable, moduleRules } from "./AuthRules";

const crc32 = require('fast-crc32c');

import Auth = auth.Auth;

export class AuthMiddleware {
    mAuth: Auth

    constructor(auth: Auth) {
        this.mAuth = auth
    }

    jwCrc32c(input: string): string {
        const tmp = crc32.calculate(input).toString(16);
        const s = tmp.padStart(8, '0').match(/.{1,2}/g);
        return s.reverse().join("").toString(16).toUpperCase();
    }

    async checkValidToken(token: string | null): Promise<AuthToken | null> {
        if (token) {
            try {
                return (await this.mAuth.verifyIdToken(token)) as AuthToken
            } catch (e) {
                console.log("Error parsing authToken")
                console.log("e ", e)
            }
        }
        return null
    }


    middleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
        const decodedAuthToken: AuthToken | null = await this.checkValidToken(context.authToken)

        const calledTableAction = fieldNameToTable(info.fieldName)
        const tablePermissions = calledTableAction ? calledTableAction.isWrite ? calledTableAction.table.write : calledTableAction.table.read : null
        // rules
        if (calledTableAction && tablePermissions && !this.preCheckPermissions(calledTableAction.table.module, tablePermissions, decodedAuthToken)) { //pre checking to figure out with the client
            return Error("Unauthorized")                                                                                                              //is already unauthorized, independent of the desired data
        }

        console.log(`1. logInput info.path: `)
        console.dir(info.path, {depth: null});
        console.log(`2. logInput info.fieldName: ${info.fieldName} `) //which function is being called
        console.log("------------------------")

        const data = await resolve(root, args, context, info)

        if (this.isAdmin(decodedAuthToken)) {
            return data
        } else if (calledTableAction && tablePermissions) {
            return this.checkPermissions(data, calledTableAction.table.module, tablePermissions, decodedAuthToken) ? data : Error("Unauthorized")
        } else {
            return data //todo, in case no table is found in AuthRules, deny access by default
        }

    }

    checkPermissions(data: any, module: ACCESS_MODULE, permissions: RequiredPermissions, token: AuthToken | null): boolean {
        if (Array.isArray(data)) {
            for (const entry of data) {
                if (!this.hasPermissions(entry, module, permissions, token))
                    return false
            }
            return true
        } else {
            return this.hasPermissions(data, module, permissions, token)
        }
    }

    isAdmin(authToken: AuthToken | null): boolean {
        return authToken != null && authToken.jw.type.adm
    }

    companyCanById(userTokenPermissions: TokenPermissions, companyId: string, module: string, action: string): boolean {
        return !companyId || userTokenPermissions.c[this.jwCrc32c(companyId)]?.some((el) => {
            moduleRules[module][action].includes(el)
        });
    }

    belongsToCompany(userTokenPermissions: TokenPermissions, data: any) {
        return !data.companyId || (userTokenPermissions.c[this.jwCrc32c(data.companyId)] || []).length >= 0;
    }

    preCheckPermissions(module: ACCESS_MODULE, permissions: RequiredPermissions, token: AuthToken | null): boolean {
        return this.isAdmin(token) || !(permissions.denyAll || (permissions.allowLogged && token == null) || (!permissions.allowAll && !token))
    }

    hasPermissions(data: any, module: ACCESS_MODULE, permissions: RequiredPermissions, token: AuthToken | null): boolean {
        if (this.isAdmin(token)) {
            return true
        }
        if (permissions.denyAll) {
            return false
        } else if (permissions.allowAll) {
            return true
        } else if (permissions.allowLogged && token != null) {
            return true
        } else if (token?.jw && permissions.allowCompanyUsers && this.belongsToCompany(token!.jw, data)) {
            return true
        } else if (!token) {
            return false
        }

        return this.hasAnyPermissions(data, token, permissions.actions, module)
    }

    hasAnyPermissions(data: any, authToken: AuthToken, actions: ACCESS_ACTION[], module: ACCESS_MODULE): boolean {
        const companyId = data.companyId ?? (() => {
            return false
        })()
        const userTokenPermissions = authToken.jw

        for (const action of actions) {
            let hasProfile = userTokenPermissions.c[this.jwCrc32c(data.matrizId)]?.some((el) => {
                moduleRules[module][action].includes(el)
            })

            if (hasProfile && action.toLowerCase().match("own")) {//beyond having the permission, the data must belong to the user
                hasProfile = authToken.auth.uid === data.anesthetistId
            }

            if (hasProfile && action === ACCESS_ACTION.MANAGE_FILIAIS) {//beyond having the permission, the data must belong to the matriz
                hasProfile = this.companyCanById(userTokenPermissions, data.matrizId, module, action)
            }

            if (hasProfile) {
                return true
            }
        }
        return false
    }


}
//todo parse automatically table names from called function name
// getTableName(fieldName: string): string|null {
//     const separatedWords = separateWordsCamelCase(fieldName)
//     const lastWord = inPlural(separatedWords[separatedWords.length - 1], 1)
//
//     if(rules[lastWord] != null) {
//         return rules[lastWord].table
//     }
//
//     if(separatedWords.length == 3)
//
//
//
//     return null
// }
//
// parseFieldName(fieldName: string) {
//     const tableName = this.getTableName(fieldName)
//     if(!tableName) return
//
//
// }