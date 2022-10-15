import { AuthToken } from "../auth/AuthMidddlewareTypes";

export const MetaMiddleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
    if (info.operation.operation.toLowerCase() !== 'mutation') {
        return await resolve(root, args, context, info)
    }

    const lowerMethodName = info.fieldName

    let meta: any = {
        updatedAt: new Date(),
        updatedBy: context.decodedAuthToken.uid,
        updatedByName: context.decodedAuthToken.name,
    }

    if (lowerMethodName.includes("create")) {
        meta = {
            ...meta,
            createdAt: new Date(),
            createdBy: context.decodedAuthToken.uid,
            createdByName: context.decodedAuthToken.name,
        }

        args.data = addMeta(args.data, meta)

    } else if (lowerMethodName.includes("update")) {
        checkSoftDeletion(args.data, meta, context.decodedAuthToken, true)
    } else if (lowerMethodName.includes("upsert")) {
        let createMeta = {
            ...meta,
            createdAt: new Date(),
            createdBy: context.decodedAuthToken.uid,
            createdByName: context.decodedAuthToken.name,
        }

        if (Array.isArray(args.data)) {
            //skip, upsertMany is not currently supported
            // for (const item of args.data) {
            //     item.create = checkSoftDeletion(item.create, createMeta, context.decodedAuthToken)
            //     item.update = checkSoftDeletion(item.update, meta, context.decodedAuthToken, true)
            // }
        } else {
            args.create = checkSoftDeletion(args.create, createMeta, context.decodedAuthToken)
            args.update = checkSoftDeletion(args.update, meta, context.decodedAuthToken, true)
        }
    }

    const data = await resolve(root, args, context, info)

    console.log('data ', data)
    return data
}

function toUpsertMeta(meta: any): any {
    let newMeta: any = {}
    for (const field in meta) {
        newMeta[field] = {
            set: meta[field]
        }
    }
    return newMeta
}

function checkSoftDeletion(data: any, meta: any, authToken: AuthToken, isUpdate: boolean = false): any {
    let mMeta = isUpdate ? toUpsertMeta(meta) : meta
    let mDeleteMeta = {
        ...meta,
        deletedAt: new Date(),
        deletedBy: authToken.uid,
        deletedByName: authToken.name,
    }
    mDeleteMeta = isUpdate ? toUpsertMeta(mDeleteMeta) : mDeleteMeta
    if (Array.isArray(data)) {
        for (let index in data) {
            if (data[index].active === false) { //deleting
                data[index] = addMeta(data[index], mDeleteMeta)
            } else {
                data[index] = addMeta(data[index], mMeta)
            }
        }

    } else {
        if (data.active === false) { //deleting
            data = addMeta(data, mDeleteMeta)
        } else {
            data = addMeta(data, mMeta)
        }
    }
    return data
}

function addMeta(data: any, meta: any): any {
    if (Array.isArray(data)) {
        for (let item of data)
            item = Object.assign(item, meta)
    } else {
        data = Object.assign(data, meta)
    }
    return data
}

// const action = {
//     "create": () => {},
//     "update": () => {},
//     "upsert": () => {},
//     "delete": () => {},
//     "createMany": () => {},
//     "updateMany": () => {},
//     "deleteMany": () => {},
// }
// createdAt:
// createdBy:
// createdByName:
// updatedAt:
// updatedBy:
// updatedByName:
// deletedAt:
// deletedBy:
// deletedByName:

// createMany
// createOne
// deleteMany
// deleteOne
// updateMany
// updateOne
// upsertOne
// upsertMany
