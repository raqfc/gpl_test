import { auth } from "firebase-admin";
import { ACCESS_ACTION, ACCESS_MODULE, AuthToken, RequiredPermissions, TokenPermissions } from "./AuthMidddlewareTypes";
import { allow, deny, rule, shield } from "graphql-shield";
import { fieldNameToTable, moduleRules, rules } from "./AuthRules";

const crc32 = require('fast-crc32c');

import Auth = auth.Auth;
import { inPlural, separateWordsCamelCase } from "../../utils/StringUtils";

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


    shieldRule = rule()(async (parent, args, ctx, info) => {
        return ctx.user.role === 'admin'
    })
    middlewareRule = rule()(async (parent, args, ctx, info) => {
        const decodedAuthToken: AuthToken | null = await this.checkValidToken(ctx.authToken)
        return this.isAdmin(decodedAuthToken);
        // else if (Array.isArray(data)) {
        //     return this.checkPermissionsArray(info.fieldName, data) ? data : Error("Unauthorized")
        // } else {
        //     return this.checkPermissions(info.fieldName, data) ? data : Error("Unauthorized")
        // }
    })

    getTableName(fieldName: string): string|null {
        const separatedWords = separateWordsCamelCase(fieldName)
        const lastWord = inPlural(separatedWords[separatedWords.length - 1], 1)

        if(rules[lastWord] != null) {
            return rules[lastWord].table
        }

        if(separatedWords.length == 3)



        return null
    }

    parseFieldName(fieldName: string) {
        const tableName = this.getTableName(fieldName)
        if(!tableName) return


    }

    middleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
        const decodedAuthToken: AuthToken | null = await this.checkValidToken(context.authToken)
        //info.fieldName


        const calledTableAction = fieldNameToTable(info.fieldName)
        // rules
        // if(calledTableAction.table && !this.preCheckPermissions(calledTableAction.table.module, ))

        // if(!this.preCheckPermissions()) //todo, pre check aqui pra n ter q fazer a query a toa
        console.log(`1. logInput info.path: `) //which function is being called
        console.dir(info.path, {depth: null});
        console.log(`2. logInput info.fieldName: ${info.fieldName} `) //which function is being called

        // if(!info.path.prev)
        //     console.log("")
        // console.log(`3. fieldNodes:`)
        // for (const field of info.fieldNodes) {
        //     // console.dir(field, { depth: 2 });
        //     console.log(`    kind: ${field.kind}`)
        //     console.log(`    alias: ${field.alias}`)
        //     console.log(`    name:`)
        //     console.log(`        kind: ${field.name.kind}`)
        //     console.log(`        name: ${field.name.name}`)
        //     console.log(`    arguments: ${field.arguments}`)
        //     console.log(`    selectionSet:`)
        //     console.log(`        kind: ${field.selectionSet?.kind}`)
        //     console.log(`        selections: `)
        //     console.dir(field.selectionSet?.selections, {depth: 1})
        // }
        console.log("------------------------")
        console.log("")

        const data = await resolve(root, args, context, info)

        if (this.isAdmin(decodedAuthToken)) {
            return data
        } else if (Array.isArray(data)) {
            return this.checkPermissionsArray(info.fieldName, data) ? data : Error("Unauthorized")
        } else {
            return this.checkPermissions(info.fieldName, data) ? data : Error("Unauthorized")
        }

    }

    decodeFieldName(fieldName: string) {

    }

    checkPermissions(path: string, data: any): boolean {

        return true
    }

    checkPermissionsArray(path: string, data: any): boolean {

        return true
    }

    isAdmin(authToken: AuthToken | null): boolean {
        return authToken != null && authToken.jw.type.adm
    }

    companyCanById(userTokenPermissions: TokenPermissions, companyId: string, module: string, action: string): boolean {
        return !companyId || userTokenPermissions.c[this.jwCrc32c(companyId)]?.some((el) => {
            moduleRules[module][action].includes(el)
        });
    }

    companyCan(userTokenPermissions: TokenPermissions, data: any, module: string, action: string) {
        return (data.companyId.size() > 0 &&
            (
                this.companyCanById(userTokenPermissions, data.companyId, module, action) ||
                (
                    data.matrizId.size() > 0 &&
                    this.companyCanById(userTokenPermissions, data.matrizId, module, action)
                )
            ))
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

    belongsToCompany(userTokenPermissions: TokenPermissions, data: any) {
        return (userTokenPermissions.c[this.jwCrc32c(data.companyId)] || []).length >= 0;
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

    preCheckPermissions(module: ACCESS_MODULE, permissions: RequiredPermissions, token: AuthToken | null): boolean {
        return this.isAdmin(token) || !(permissions.denyAll || (permissions.allowLogged && token == null) || (!permissions.allowAll && !token))
    }

}