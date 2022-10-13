import { ACCESS_ACTION, ACCESS_MODULE, AuthToken, RequiredPermissions, TokenPermissions } from "./AuthMidddlewareTypes";
import { fieldNameToTable, moduleRules } from "./AuthRules";
import { IAuth } from "./IAuth";

const crc32 = require('fast-crc32c');


export class AuthMiddleware {
    private mAuth: IAuth

    constructor(auth: IAuth) {
        this.mAuth = auth
    }

    private jwCrc32c(input: string): string {
        const tmp = crc32.calculate(input).toString(16);
        const s = tmp.padStart(8, '0').match(/.{1,2}/g);
        return s.reverse().join("").toString(16).toUpperCase();
    }

    async checkValidToken(token: string | null): Promise<AuthToken | null> {
        if (token) {
            try {
                return (await this.mAuth.verifyIdToken(token))
            } catch (e) {
                console.log("Error parsing authToken")
                console.log("e ", e)
            }
        }
        return null
    }


    middleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
        const decodedAuthToken: AuthToken | null = await this.checkValidToken(context.authToken)
        const isWrite = info.operation.operation.toLowerCase() === 'mutation'

        const tableRules = fieldNameToTable(info.fieldName)
        const tablePermissions = tableRules ? (isWrite ? tableRules.write : tableRules.read) : null

        console.log(`1. logInput info.fieldName: ${info.fieldName} `) //which function is being called
        console.log(`2. logInput foundTable: ${tableRules?.table}`)
        console.log("------------------------")

        if (!tableRules || !tablePermissions || !this.hasPermissions(args, tableRules.module, tablePermissions, decodedAuthToken))
            return Error("Unauthorized")

        return await resolve(root, args, context, info)
    }

    isAdmin(authToken: AuthToken | null): boolean {
        return authToken != null && authToken.jw.type.adm
    }

    private companyCanById(userTokenPermissions: TokenPermissions, companyId: string|null, module: string, action: string): boolean {
        return companyId != null && userTokenPermissions.c[this.jwCrc32c(companyId)]?.some((el) => {
            moduleRules[module][action].includes(el)
        });
    }

    private belongsToCompany(userTokenPermissions: TokenPermissions, companyId: string | null) {
        return companyId && (userTokenPermissions.c[this.jwCrc32c(companyId)] || []).length >= 0;
    }

    private hasPermissions(args: any, module: ACCESS_MODULE, permissions: RequiredPermissions, token: AuthToken | null): boolean {
        if (this.isAdmin(token)) {
            return true
        }
        if (permissions.denyAll) {
            return false
        } else if (permissions.allowAll) {
            return true
        } else if (permissions.allowLogged && token != null) {
            return true
        } else if (token?.jw && permissions.allowCompanyUsers && this.belongsToCompany(token!.jw, args.companyId)) {
            return true
        } else if (!token) {
            return false
        }

        return this.hasAnyActionsPermissions(args, token, permissions.actions, module)
    }

    private hasAnyActionsPermissions(args: any, authToken: AuthToken, actions: ACCESS_ACTION[], module: ACCESS_MODULE): boolean {
        const companyId = args.companyId ?? (() => {
            return false
        })()
        const userTokenPermissions = authToken.jw

        for (const action of actions) {
            let hasProfile = userTokenPermissions.c[this.jwCrc32c(companyId)]?.some((el) => {
                moduleRules[module][action].includes(el)
            })

            if (hasProfile && action.toLowerCase().includes("own")) {//beyond having the permission, the data must belong to the user
                hasProfile = authToken.uid === args.anesthetistId
            }

            if (hasProfile && action === ACCESS_ACTION.MANAGE_FILIAIS) {//beyond having the permission, the user must belong to the matriz
                hasProfile = this.companyCanById(userTokenPermissions, args.matrizId, module, action)
            }

            if (hasProfile) {
                return true
            }
        }
        return false
    }


}