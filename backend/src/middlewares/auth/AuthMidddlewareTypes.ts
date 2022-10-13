import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export type AuthToken = {
    jw: TokenPermissions,
    aud: string,
    name: string,
    uid: string
}

export type TokenPermissions = {
    c: CompanyProfiles
    type: UserTokenType
}

export type CompanyProfiles = {
    [company: string]: string[]
}

export type UserTokenType = {
    cli: boolean //if it's a client
    adm: boolean //if it's an admin
}

export type ModuleRules = {
    [module: string]: ActionProfiles
}

export type Rules = {
    [module: string]: TableRules
}
export type CalledTableAction = {
    isWrite: boolean,
    table: TableRules
}

export type ActionProfiles = {
    [action: string]: string[]//array of profiles that can perform
}

export type TableMethods = {
    [table: string]: string[]
}

export type TableRules = {
    table: string
    module: ACCESS_MODULE
    write: RequiredPermissions
    read: RequiredPermissions
}

export type RequiredPermissions = {
    denyAll: boolean
    allowAll: boolean
    allowLogged: boolean
    allowCompanyUsers: boolean
    actions: ACCESS_ACTION[]
}


export enum ACCESS_ACTION {
    LIST = "list",
    LIST_OWN = "listOwn",
    MANAGE_FILIAIS = "manageFiliais",
    MANAGER = "manager",
    READ = "read",
    READ_OWN = "readOwn",
    REVERT_STATUS = "revert_status",
    REMOVE = "rm",
    SCHEDULER = "scheduler",
    WRITE = "write",
    WRITE_OWN = "writeOwn",
}

export enum ACCESS_MODULE {
    ANESTHETISTS = "anesthetists",
    BATCHES = "batches",
    BILLING = "billing",
    COMPANIES = "companies",
    DASHBOARD = "dashboard",
    DEMANDS = "demands",
    EVENTS = "events",
    EVENTS_EXPORTS = "eventsExports",
    FORMS = "forms",
    FORMS_QA = "formsQA",
    HEALTH_INSURANCES = "healthInsurances",
    HOSPITALS = "hospitals",
    INTEGRATIONS = "integrations",
    INVOICES = "invoices",
    OCR = "ocr",
    PATIENTS = "patients",
    SCHEDULE = "schedule",
    SCHEDULE_OFF = "scheduleOff",
    SCHEDULE_ON_CALL = "scheduleOnCall",
    SCHEDULE_ON_DUTY = "scheduleOnDuty",
    SLOT_CATEGORIES = "slotCategories",
    SURGEONS = "surgeons",
    TAGS = "tags",
    USER_SCHEDULE = "userSchedule",
    WORKLOADS = "workloads",
    WORKPLACES = "workplaces",


    NONE = ""
}

export enum ACCESS_PROFILE {
    ADMIN = "a",
    ANESTHETIST = "b",
    SCHEDULE_MANAGER = "c",
    SCHEDULER = "d",
    BILLING_MANAGER = "e",
    BILLER = "f",
    RESIDENT = "g",
    FORM_MANAGER = "h",
}