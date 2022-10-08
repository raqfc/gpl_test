import { auth } from "firebase-admin";
import CRC32 from "crc-32";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import Auth = auth.Auth;
import { AuthToken, Rules, TokenPermissions } from "./AuthMidddlewareTypes";

export class AuthMiddleware {
    mAuth: Auth

    constructor(auth: Auth) {
        this.mAuth = auth
    }


    jwCrc32c = (input: string) => {
        return CRC32.str(input).toString(16);
    }

    async checkValidToken(token: string|null): Promise<AuthToken | null> {
        if (token) {
            try {
                return  (await this.mAuth.verifyIdToken(token)) as AuthToken
            } catch (e) {
                console.log("Error parsing authToken")
                console.log("e ", e)
            }
        }
        return null
    }

    middleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
        const decodedAuthToken: AuthToken | null  = await this.checkValidToken(context.authToken)
        //info.fieldName

        console.log("verifiedIdToken", decodedAuthToken)
        console.log(`1. logInput info: ${info}`) //which function is being called

        const data = await resolve(root, args, context, info)

        if (this.isAdmin(decodedAuthToken)) {
            return data
        } else if (Array.isArray(data)) {
            return this.checkPermissionsArray(info.fieldName, data) ? data : Error("Unauthorized")
        } else {
            return this.checkPermissions(info.fieldName, data) ? data : Error("Unauthorized")
        }

    }

    checkPermissions(path: string, data: any): boolean {

        // match /companies/{companyId} {
        //     allow read: if companyCan2('companies', 'read', 'list');
        //     allow write: if companyCan('companies', 'write');
        //     allow read: if companyCanById(resource.data.matrizId,'companies', 'manageFilias');
        //     allow write: if companyCanById(resource.data.matrizId,'companies', 'manageFilias');
        //     allow read: if request.auth.uid in resource.data.userIds;
        //     //  allow write: if request.auth.uid==userId;
        // }
        //
        //
        // match /cbhpm/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /especialidades/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /procedimentos/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /resumesCuteReason/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /resumesProcedures/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /cuteReason/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /accessActions/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /accessModules/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /accessProfiles/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /proceduresParticular/{documentId} {
        //     allow read: if request.auth != null;
        // }
        // match /xmlVersions/{documentId} {
        //     allow read: if request.auth != null;
        // }
        //
        //
        //
        // match /config/{documentId} {
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
        // match /taxes/{documentId} {
        //     allow read: if companyCanReadBase();
        //     allow write: if companyCanReadBase();
        // }
        // match /forms/{documentId} {
        //     allow read: if true;
        //     allow write: if true;
        // }
        // match /formsCategories/{documentId} {
        //     allow read: if true;
        //     allow write: if true;
        // }
        //
        //
        //
        //
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
        // match /batches/{documentId} {
        //     allow read: if companyCanReadBase();
        // }
        //
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
        return true
    }

    checkPermissionsArray(path: string, data: any): boolean {

        return true
    }

    isAdmin(authToken: AuthToken | null): boolean {
        return authToken != null && authToken.jw.type.adm
    }

    companyCanById(userTokenPermissions: TokenPermissions, companyId: string, module: string, action: string) {
        // return !companyId || userTokenPermissions.c.get(this.jwCrc32c(companyId))?.some(this.rules[module][action]);
    }
    //
    // companyCan(module: string, action: string) {
    //     let cl = request.auth.token.jw;
    //     let test = rules();
    //     return (resource.data.companyId.size() > 0 &&
    //             (
    //                 cl.c[jwCrc32c(resource.data.companyId)].hasAny(test[module][action]) ||
    //                 (
    //                     resource.data.matrizId.size() > 0 &&
    //                     cl.c[jwCrc32c(resource.data.matrizId)].hasAny(test[module][action])
    //                 )
    //             ))
    //         || resource == null;
    //
    // }
    //
    // companyCan2(module: string, action: string, action2: string) {
    //     let cl = request.auth.token.jw;
    //     let test = rules();
    //     return (resource.data.companyId.size() > 0 &&
    //             (
    //                 cl.c[jwCrc32c(resource.data.companyId)].hasAny(test[module][action]) ||
    //                 (
    //                     resource.data.matrizId.size() > 0 &&
    //                     cl.c[jwCrc32c(resource.data.matrizId)].hasAny(test[module][action])
    //                 ) ||
    //                 cl.c[jwCrc32c(resource.data.companyId)].hasAny(test[module][action2]) ||
    //                 (
    //                     resource.data.matrizId.size() > 0 &&
    //                     cl.c[jwCrc32c(resource.data.matrizId)].hasAny(test[module][action2])
    //                 )
    //             ))
    //         || resource == null;
    // }
    //
    // companyCanOwnAnesthetistId(module: string, action: string) {
    //     let cl = request.auth.token.jw;
    //     let test = rules();
    //     return resource.data.companyId.size() > 0 &&
    //         resource.data.anesthetistId == request.auth.uid &&
    //         (
    //             cl.c[jwCrc32c(resource.data.companyId)].hasAny(test[module][action]) ||
    //             (
    //                 resource.data.matrizId.size() > 0 &&
    //                 cl.c[jwCrc32c(resource.data.matrizId)].hasAny(test[module][action])
    //             )
    //         );
    // }
    //
    // companyCanReadBase() {
    //     let cl = request.auth.token.jw;
    //     return cl.c[jwCrc32c(resource.data.companyId)].size() >= 0;
    //     // return cl.c[jwCrc32c(resource.data.companyId)] is list;
    // }
    //
    // companyCanReadBaseArrayIds() {
    //     return true; // TODO
    //     // let cl = request.auth.token.jw;
    //     // return resource.data.companyIds.hasAny(cl.c.keys());
    // }



    private rules: Rules =  {
        "eventsExports": {
            "list": ["a","f"],
            "read": ["a","f"],
            "readOwn": ["a","b","f"],
            "write": ["a","f"],
            "listOwn": ["a","b","f"]
        },
        "billing": {
            "list": ["a","e","f"],
            "read": ["a","e","f"],
            "write": ["a","e","f"],
            "writeOwn": ["a"]
        },
        "companies": {
            "list": ["a","b"],
            "manageFilias": ["a","b"],
            "read": ["a","b"],
            "write": ["a","b"]
        },
        "healthInsurances": {
            "list": ["a","b","e","f"],
            "read": ["a","b","e","f"],
            "write": ["a","e","f"]
        },
        "surgeons": {
            "list": ["a","b","e","f"],
            "read": ["a","b","f"],
            "write": ["a","b","f"]
        },
        "batches": {
            "list": ["a","e","f"],
            "read": ["a","e","f"],
            "write": ["a","e","f"]
        },
        "events": {
            "list": ["a","e","f"],
            "read": ["a","e","f"],
            "readOwn": ["a","b","e","f","g"],
            "write": ["a","b","e","f","g"],
            "writeOwn": ["a","b","e","f","g"],
            "listOwn": ["a","b","e","f","g"]
        },
        "dashboard": {
            "list": ["a","e","f"],
            "read": ["a","e","f"],
            "readOwn": ["a","b","e","f"],
            "write": ["a","e","f"],
            "listOwn": ["a"]
        },
        "hospitals": {
            "list": ["a","b","e","f"],
            "read": ["a","f"],
            "write": ["a","f"]
        },
        "forms": {
            "list": ["a"],
            "read": ["a"],
            "write": ["a"]
        },
        "integrations": {
            "list": ["a","b"],
            "read": ["a","b"],
            "write": ["a","b"]
        },
        "schedule": {
            "list": ["a","c","d"],
            "read": ["a","c","d"],
            "write": ["a","c","d"],
            "listOwn": ["a","b","c"],
            "readOwn": ["a","b","c"],
            "writeOwn": ["a","b","c"],
            "manager": ["a","c"],
            "scheduler": ["a","c","d"],
            "managerDemand": ["a","c"],
            "managerSchedulerOff": ["a","c"],
            "managerSchedulerOffOwn": ["a","c"],
            "managerSlotCategory": ["a","c"],
            "managerWorkload": ["a","c"],
            "managerWorkloadOwn": ["a","c"]
        },
        "formsQA": {
            "list": ["a"],
            "read": ["a"],
            "write": ["a"],
            "readOwn": ["a","b"],
            "writeOwn": ["a","b"]
        },
        "ocr": {
            "list": ["a","b","f"],
            "read": ["a","b","f"],
            "write": ["a","b","f"]
        },
        "invoices": {
            "list": ["a","e","f"],
            "read": ["a","e","f"],
            "write": ["a","e","f"]
        },
        "patients": {
            "list": ["a","b","e","f"],
            "read": ["a","f"],
            "write": ["a","b","f"]
        },
        "anesthetists": {
            "list": ["a","b","c","d","e","f","g"],
            "read": ["a","c","f"],
            "write": ["a","f"],
            "readOwn": ["a","b","c","d","e","f"],
            "writeOwn": ["a","b","c","d","e","f"]
        }
    };

}