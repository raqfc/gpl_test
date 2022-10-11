import { ACCESS_ACTION, ACCESS_MODULE, ModuleRules, Rules, TableRules } from "./AuthMidddlewareTypes";

export const moduleRules: ModuleRules = {
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


type CalledTableAction = {
    isWrite: boolean,
    table: TableRules | null
}

//isWrite, tableRules
export function fieldNameToTable(fieldName: string): CalledTableAction {
    switch (fieldName) {
        case "aggregateUser":
            return {
                isWrite:
                    false,
                table: rules["company_users"]
            }
        case "createManyUser":
            return {
                isWrite:
                    true,
                table: rules["company_users"]
            }
        case "createOneUser":
            return {
                isWrite:
                    true,
                table: rules["company_users"]
            }
        case "deleteManyUser":
            return {
                isWrite:
                    true,
                table: rules["company_users"]
            }
        case "deleteOneUser":
            return {
                isWrite:
                    true,
                table: rules["company_users"]
            }
        case "findFirstUser":
            return {
                isWrite:
                    false,
                table: rules["company_users"]
            }
        case "users":
            return {
                isWrite:
                    false,
                table: rules["company_users"]
            }
        case "user":
            return {
                isWrite:
                    false,
                table: rules["company_users"]
            }
        case "groupByUser":
            return {
                isWrite:
                    false,
                table: rules["company_users"]
            }
        case "updateManyUser":
            return {
                isWrite:
                    true,
                table: rules["company_users"]
            }
        case "updateOneUser":
            return {
                isWrite:
                    true,
                table: rules["company_users"]
            }
        case "upsertOneUser":
            return {
                isWrite:
                    true,
                table: rules["company_users"]
            }

    }
    return {
        isWrite:
            true,
        table: null
    }
}

export const rules: Rules = {
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
            allowCompanyUsers: true,//todo
            actions: [ACCESS_ACTION.WRITE],
        },
        read: {
            denyAll: false,
            allowAll: false,
            allowLogged: false,
            allowCompanyUsers: true,//todo
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
            allowCompanyUsers: true,//todo
            actions: [],
        },
        read: {
            denyAll: false,
            allowAll: false,
            allowLogged: false,
            allowCompanyUsers: true,//todo
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
            allowCompanyUsers: true,//todo
            actions: [ACCESS_ACTION.WRITE],
        },
        read: {
            denyAll: false,
            allowAll: false,
            allowLogged: false,
            allowCompanyUsers: true,//todo
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
            allowCompanyUsers: true,//todo
            actions: [ACCESS_ACTION.WRITE],
        },
        read: {
            denyAll: false,
            allowAll: false,
            allowLogged: false,
            allowCompanyUsers: true,//todo
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
            allowLogged: true,
            allowCompanyUsers: true,//todo
            actions: [ACCESS_ACTION.WRITE],
        },
        read: {
            denyAll: false,
            allowAll: false,
            allowLogged: false,
            allowCompanyUsers: true,//todo
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
            allowCompanyUsers: true,//todo
            actions: [ACCESS_ACTION.WRITE],
        },
        read: {
            denyAll: false,
            allowAll: false,
            allowLogged: false,
            allowCompanyUsers: true,//todo
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
    "adminUsersPublicMirror": {
        table: "adminUsersPublicMirror",
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
            allowLogged: false,
            allowCompanyUsers: false,
            actions: []
        }
    },
    "blog": {
        table: "blog",
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
            allowLogged: false,
            allowCompanyUsers: false,
            actions: []
        }
    },
    "blogCategories": {
        table: "blogCategories",
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
            allowLogged: false,
            allowCompanyUsers: false,
            actions: []
        }
    },
    "faqs": {
        table: "faqs",
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
            allowLogged: false,
            allowCompanyUsers: false,
            actions: []
        }
    },
    "faqsCategories": {
        table: "faqsCategories",
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
            allowLogged: false,
            allowCompanyUsers: false,
            actions: []
        }
    },
    "forms": {
        table: "forms",
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
            allowLogged: false,
            allowCompanyUsers: false,
            actions: []
        }
    },
    "formsCategories": {
        table: "forms",
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
            allowLogged: false,
            allowCompanyUsers: false,
            actions: []
        }
    },
};