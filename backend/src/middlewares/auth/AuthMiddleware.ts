import { auth } from "firebase-admin";
import {
    ACCESS_ACTION,
    ACCESS_MODULE,
    AuthToken,
    ModuleRules,
    RequiredPermissions,
    Rules,
    TokenPermissions
} from "./AuthMidddlewareTypes";
import { rule, shield } from "graphql-shield";

const crc32 = require('fast-crc32c');

import Auth = auth.Auth;

export class AuthMiddleware {
    mAuth: Auth

    constructor(auth: Auth) {
        this.mAuth = auth
    }

    jwCrc32c(input:string):string {
        const tmp = crc32.calculate(input).toString(16);
        // return Buffer.from(tmp, 'hex').readInt32LE().toString(16);
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

    shieldMiddleware = shield({
        Query: {
            // aggregateUser:
            // createManyUser
            // createOneUser
            // deleteManyUser
            // deleteOneUser
            // findFirstUser
            // users
            // user:
            // groupByUser
            // updateManyUser
            // updateOneUser
            // upsertOneUser
        }
    })


    shieldRule = rule()(async (parent, args, ctx, info) => {
        return ctx.user.role === 'admin'
    })

    middleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
        const decodedAuthToken: AuthToken | null = await this.checkValidToken(context.authToken)
        //info.fieldName

        //agregate* :
        //  operation:
        //      kind: OperationDefinition
        //      operation: Query
        //*s(getall) :
        //  operation:
        //      kind: OperationDefinitions
        //      operation: Query

        // console.log("verifiedIdToken", decodedAuthToken)
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
            this.moduleRules[module][action].includes(el)
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

    hasAnyPermissions(data: any, authToken: AuthToken, actions: ACCESS_ACTION[], module: ACCESS_MODULE): boolean{
        const companyId = data.companyId ?? (() => {return false})()
        const userTokenPermissions = authToken.jw

        for(const action of actions) {
            let hasProfile = userTokenPermissions.c[this.jwCrc32c(data.matrizId)]?.some((el) => {
                this.moduleRules[module][action].includes(el)
            })

            if(hasProfile && action.toLowerCase().match("own")) {//beyond having the permission, the data must belong to the user
                hasProfile = authToken.auth.uid === data.anesthetistId
            }

            if(hasProfile && action === ACCESS_ACTION.MANAGE_FILIAIS) {//beyond having the permission, the data must belong to the matriz
                hasProfile = this.companyCanById(userTokenPermissions, data.matrizId, module, action)
            }

            if(hasProfile) {
                return true
            }
        }
        return false
    }

    belongsToCompany(userTokenPermissions: TokenPermissions, data: any) {
        return (userTokenPermissions.c[this.jwCrc32c(data.companyId)] || []).length >= 0;
    }

    hasPermissions(data: any, module: ACCESS_MODULE, permissions: RequiredPermissions, token?: AuthToken): boolean   {
        if(permissions.denyAll) {
            return false
        } else if (permissions.allowAll) {
            return true
        } else if (permissions.allowLogged && token != null) {
            return true
        } else if (token?.jw && permissions.allowCompanyUsers && this.belongsToCompany(token!.jw, data)) {
            return true
        } else if(!token) {
            return false
        }

        return this.hasAnyPermissions(data, token, permissions.actions, module)
    }


    private moduleRules: ModuleRules = {
        "eventsExports": {
            "list": ["a", "f"],
            "read": ["a", "f"],
            "readOwn": ["a", "b", "f"],
            "write": ["a", "f"],
            "listOwn": ["a", "b", "f"]
        },
        "billing": {
            "list": ["a", "e", "f"],
            "read": ["a", "e", "f"],
            "write": ["a", "e", "f"],
            "writeOwn": ["a"]
        },
        "companies": {
            "list": ["a", "b"],
            "manageFilias": ["a", "b"],
            "read": ["a", "b"],
            "write": ["a", "b"]
        },
        "healthInsurances": {
            "list": ["a", "b", "e", "f"],
            "read": ["a", "b", "e", "f"],
            "write": ["a", "e", "f"]
        },
        "surgeons": {
            "list": ["a", "b", "e", "f"],
            "read": ["a", "b", "f"],
            "write": ["a", "b", "f"]
        },
        "batches": {
            "list": ["a", "e", "f"],
            "read": ["a", "e", "f"],
            "write": ["a", "e", "f"]
        },
        "events": {
            "list": ["a", "e", "f"],
            "read": ["a", "e", "f"],
            "readOwn": ["a", "b", "e", "f", "g"],
            "write": ["a", "b", "e", "f", "g"],
            "writeOwn": ["a", "b", "e", "f", "g"],
            "listOwn": ["a", "b", "e", "f", "g"]
        },
        "dashboard": {
            "list": ["a", "e", "f"],
            "read": ["a", "e", "f"],
            "readOwn": ["a", "b", "e", "f"],
            "write": ["a", "e", "f"],
            "listOwn": ["a"]
        },
        "hospitals": {
            "list": ["a", "b", "e", "f"],
            "read": ["a", "f"],
            "write": ["a", "f"]
        },
        "forms": {
            "list": ["a"],
            "read": ["a"],
            "write": ["a"]
        },
        "integrations": {
            "list": ["a", "b"],
            "read": ["a", "b"],
            "write": ["a", "b"]
        },
        "schedule": {
            "list": ["a", "c", "d"],
            "read": ["a", "c", "d"],
            "write": ["a", "c", "d"],
            "listOwn": ["a", "b", "c"],
            "readOwn": ["a", "b", "c"],
            "writeOwn": ["a", "b", "c"],
            "manager": ["a", "c"],
            "scheduler": ["a", "c", "d"],
            "managerDemand": ["a", "c"],
            "managerSchedulerOff": ["a", "c"],
            "managerSchedulerOffOwn": ["a", "c"],
            "managerSlotCategory": ["a", "c"],
            "managerWorkload": ["a", "c"],
            "managerWorkloadOwn": ["a", "c"]
        },
        "formsQA": {
            "list": ["a"],
            "read": ["a"],
            "write": ["a"],
            "readOwn": ["a", "b"],
            "writeOwn": ["a", "b"]
        },
        "ocr": {
            "list": ["a", "b", "f"],
            "read": ["a", "b", "f"],
            "write": ["a", "b", "f"]
        },
        "invoices": {
            "list": ["a", "e", "f"],
            "read": ["a", "e", "f"],
            "write": ["a", "e", "f"]
        },
        "patients": {
            "list": ["a", "b", "e", "f"],
            "read": ["a", "f"],
            "write": ["a", "b", "f"]
        },
        "anesthetists": {
            "list": ["a", "b", "c", "d", "e", "f", "g"],
            "read": ["a", "c", "f"],
            "write": ["a", "f"],
            "readOwn": ["a", "b", "c", "d", "e", "f"],
            "writeOwn": ["a", "b", "c", "d", "e", "f"]
        }
    };

    private rules: Rules = {
        "eventsExports": {
            table: "eventsExports",//as determined in the db
            module: ACCESS_MODULE.EVENTS_EXPORTS,//as saved in the client
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE]
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ]
            }
        },
        "usertoken": {
            table: "usertoken",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "company_cirurgioes": {
            table: "company_cirurgioes",
            module: ACCESS_MODULE.SURGEONS,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "company_users": {
            table: "company_users",
            module: ACCESS_MODULE.ANESTHETISTS,
            write: {
                denyAll: false,
                allowAll: true,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.READ_OWN, ACCESS_ACTION.LIST, ACCESS_ACTION.LIST_OWN]
            }
        },
        "healthInsurances": {
            table: "healthInsurances",
            module: ACCESS_MODULE.HEALTH_INSURANCES,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "historyHealthInsurances": {
            table: "historyHealthInsurances",
            module: ACCESS_MODULE.HEALTH_INSURANCES,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "company_hospitais": {
            table: "company_hospitais",
            module: ACCESS_MODULE.HOSPITALS,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "guidesOcr": {
            table: "guidesOcr",
            module: ACCESS_MODULE.OCR,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "eventOcrCommunication": {
            table: "eventOcrCommunication",
            module: ACCESS_MODULE.OCR,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "batches": {
            table: "batches",
            module: ACCESS_MODULE.BATCHES,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "invoices": {
            table: "invoices",
            module: ACCESS_MODULE.INVOICES,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "patients": {
            table: "patients",
            module: ACCESS_MODULE.PATIENTS,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "monthlyCount": {
            table: "monthlyCount",
            module: ACCESS_MODULE.DASHBOARD,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "monthlyCountAnesthetist": {
            table: "monthlyCountAnesthetist",
            module: ACCESS_MODULE.DASHBOARD,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST, ACCESS_ACTION.READ_OWN]
            }
        },
        "events": {
            table: "events",
            module: ACCESS_MODULE.EVENTS,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE, ACCESS_ACTION.WRITE_OWN],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.READ_OWN, ACCESS_ACTION.LIST, ACCESS_ACTION.LIST_OWN]
            }
        },
        "historyEvents": {
            table: "historyEvents",
            module: ACCESS_MODULE.EVENTS,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.READ_OWN, ACCESS_ACTION.LIST, ACCESS_ACTION.LIST_OWN]
            }
        },
        "eventsResumeFetched": {
            table: "eventsResumeFetched",
            module: ACCESS_MODULE.EVENTS,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.READ_OWN, ACCESS_ACTION.LIST, ACCESS_ACTION.LIST_OWN]
            }
        },
        "integrationsEvents": {
            table: "integrationsEvents",
            module: ACCESS_MODULE.EVENTS,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE, ACCESS_ACTION.WRITE_OWN],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.READ_OWN, ACCESS_ACTION.LIST, ACCESS_ACTION.LIST_OWN]
            }
        },
        "xlsxDownload": {
            table: "xlsxDownload",
            module: ACCESS_MODULE.EVENTS_EXPORTS,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.READ_OWN, ACCESS_ACTION.LIST, ACCESS_ACTION.LIST_OWN]
            }
        },
        "institutions": {
            table: "institutions",
            module: ACCESS_MODULE.INTEGRATIONS,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "integrationsMirror": {
            table: "integrationsMirror",
            module: ACCESS_MODULE.INTEGRATIONS,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.READ, ACCESS_ACTION.LIST]
            }
        },
        "companies": {
            table: "companies",
            module: ACCESS_MODULE.COMPANIES,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.MANAGE_FILIAIS, ACCESS_ACTION.WRITE],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [ACCESS_ACTION.MANAGE_FILIAIS, ACCESS_ACTION.READ, ACCESS_ACTION.LIST, ACCESS_ACTION.READ_OWN, ACCESS_ACTION.LIST_OWN]
            }
        },
        "cbhpm": {
            table: "cbhpm",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "especialidades": {
            table: "especialidades",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "procedimentos": {
            table: "procedimentos",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "resumesCuteReason": {
            table: "resumesCuteReason",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "resumesProcedures": {
            table: "resumesProcedures",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "cuteReason": {
            table: "cuteReason",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "accessActions": {
            table: "accessActions",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "accessModules": {
            table: "accessModules",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "accessProfiles": {
            table: "accessProfiles",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "proceduresParticular": {
            table: "proceduresParticular",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "xmlVersions": {
            table: "xmlVersions",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "config": {
            table: "config",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: true,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: false,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: true,
                allowLogged: true,
                allowCompanyUsers: false,
                actions: []
            }
        },
        "taxes": {
            table: "taxes",
            module: ACCESS_MODULE.NONE,
            write: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: true,
                actions: [],
            },
            read: {
                denyAll: false,
                allowAll: false,
                allowLogged: false,
                allowCompanyUsers: true,
                actions: []
            }
        },
    };

// match /batches/{documentId} {
//     allow read: if companyCanReadBase();
// }
// // Base Company utilizado para as caches, o client ainda vai validar usando as rules
// match /company_cirurgioes/{documentId} {
//     allow read: if companyCanReadBase();
// }
// match /company_hospitais/{documentId} {
//     allow read: if companyCanReadBase();
// }
// match /company_cirurgioes/{documentId} {
//     allow read: if companyCanReadBase();
// }
// match /healthInsurances/{documentId} {
//     allow read: if companyCanReadBase();
// }
// match /company_users/{documentId} {
//     allow read: if companyCanReadBaseArrayIds(); // && resource.data.is_anestesista==true;
// }
//
// match /invoices/{documentId} {
//     allow read: if companyCanReadBase();
// }

//
// match /{document=**} {
//     allow write: if isAdmin();
//     allow read: if isAdmin();
// }
//
//
// // TMP
// match /{document=**} {
//     allow write: if true;
//     allow read: if true;
// }

// match /adminUsersPublicMirror/{documentId} {
//     allow read: if true;
// }
// match /blog/{documentId} {
//     allow read: if true;
// } 
// match /blogCategories/{documentId} {
//     allow read: if true;
// }
// match /faqs/{documentId} {
//     allow read: if true;
// }
// match /faqsCategories/{documentId} {
//     allow read: if true;
// }
    // match /forms/{documentId} {
//     allow read: if true;
//     allow write: if true;
// }
// match /formsCategories/{documentId} {
//     allow read: if true;
//     allow write: if true;
// }

}