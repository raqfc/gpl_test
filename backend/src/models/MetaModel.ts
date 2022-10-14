import { AuthToken } from "../middlewares/auth/AuthMidddlewareTypes";

export class MetaModel {
    constructor(meta: any) {
        this.createdAt = new Date(meta.createdAt)
        this.createdBy = meta.createdBy
        this.createdByName = meta.createdByName
        this.updatedAt = new Date(meta.updatedAt)
        this.updatedBy = meta.updatedBy
        this.updatedByName = meta.updatedByName
        this.deletedAt = new Date(meta.deletedAt)
        this.deletedBy = meta.deletedBy
        this.deletedByName = meta.deletedByName
    }

    createdAt: Date
    createdBy: string
    createdByName: string
    updatedAt: Date
    updatedBy: string
    updatedByName: string
    deletedAt: Date
    deletedBy: string
    deletedByName: string

    createMeta(token: AuthToken): MetaModel {
        this.createdAt = new Date()
        this.createdBy = token.uid
        this.createdByName = token.name

        this.updatedAt = new Date()
        this.updatedBy = token.uid
        this.updatedByName = token.name

        return this
    }

    updateMeta(token: AuthToken, isDelete: boolean): MetaModel {
        this.updatedAt = new Date()
        this.updatedBy = token.uid
        this.updatedByName = token.name

        if(isDelete) {
            this.deletedAt = new Date()
            this.deletedBy = token.uid
            this.deletedByName = token.name
        }

        return this
    }

}