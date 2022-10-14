export class MetaMiddleware {

    writeActions: string[] = [
        "create",
        "update",
        "upsert",
        "delete",
        "createMany",
        "updateMany",
        "deleteMany",
    ]
    ACTIONS =  {
        CREATE: ["create", "createMany"],
        UPDATE: ["update", "updateMany"],
        DELETE: ["delete", "deleteMany"],
        UPSERT: ["upsert", "upsertMany"]
    }
// {
//     "args": {},
//     "dataPath": [],
//     "runInTransaction": false,
//     "action": "findMany",
//     "model": "User"
// }
    prismaMiddleware = async  (params: any, next: (params: any) => Promise<any>) => {

        if(!this.writeActions.includes(params.action))
            return next(params)

        const isMany = params.action.includes("many")

        const action = {
            "create": () => {},
            "update": () => {},
            "upsert": () => {},
            "delete": () => {},
            "createMany": () => {},
            "updateMany": () => {},
            "deleteMany": () => {},
        }


        // let meta: any = {
        //     updatedAt: new Date(),
        //     updatedBy: context.decodedAuthToken.uid,
        //     updatedByName: context.decodedAuthToken.name,
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
        // if(lowerMethodName.includes("create")) {
        //
        //
        // } else if(lowerMethodName.includes("update")) {
        //
        // } else if (lowerMethodName.includes("delete")) {
        //     meta = {
        //         ...meta,
        //         deletedAt: new Date(),
        //         deletedBy: context.decodedAuthToken.uid,
        //         deletedByName: context.decodedAuthToken.name,
        //     }
        // } else {
        //     action = ACTIONS.UPSERT
        // }
        console.log(params)
        return next(params)
    }

    middleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
        if (info.operation.operation.toLowerCase() !== 'mutation') {
            return await resolve(root, args, context, info)
        }

        // context.decodedAuthToken
        // context.table

        //info.fieldName
        //info.path.key


        const lowerMethodName = info.fieldName
        const isMany = lowerMethodName.includes("many")

        let action
        let meta: any = {
            updatedAt: new Date(),
            updatedBy: context.decodedAuthToken.uid,
            updatedByName: context.decodedAuthToken.name,
        }
        // createdAt:
        // createdBy:
        // createdByName:
        // updatedAt:
        // updatedBy:
        // updatedByName:
        // deletedAt:
        // deletedBy:
        // deletedByName:
        if(lowerMethodName.includes("create")) {
            // action = ACTIONS.CREATE
            meta = {
                ...meta,
                createdAt: new Date(),
                createdBy: context.decodedAuthToken.uid,
                createdByName: context.decodedAuthToken.name,
            }

            if(isMany) {
                for (const item of args.data)
                    item.meta = {create: meta }
            } else {
                args.data.meta = {create: meta }
            }

        } else if(lowerMethodName.includes("update")) {
            // action = ACTIONS.UPDATE
            if(args.data.active === false) { //deleting
                meta = {
                    ...meta,
                    deletedAt: new Date(),
                    deletedBy: context.decodedAuthToken.uid,
                    deletedByName: context.decodedAuthToken.name,
                }
                if(isMany) {
                    for (const item of args.data)
                        item.meta = {create: meta }
                } else {
                    args.data.meta = {create: meta }
                }
            }
        }
        // else if (lowerMethodName.includes("delete")) {
        //
        // }
        else if(lowerMethodName.includes("upsert")) {
            // action = ACTIONS.UPSERT
            let createMeta = {
                ...meta,
                createdAt: new Date(),
                createdBy: context.decodedAuthToken.uid,
                createdByName: context.decodedAuthToken.name,
            }
            if(isMany) {
                for (const item of args.data) {
                    item.create.meta  = {create: createMeta }
                    item.update.meta = {create: meta }
                }
            } else {
                args.create.meta.create = createMeta
                args.update.meta.connect = meta
            }
        }

        const data = await resolve(root, args, context, info)

        console.log('data ', data)
        // data.id on create
        //on create many only count is returned
        return data
        //options
        //apart table with only the updatedAt present in the main table
        //all fields in the main table
        //json (problem -> updating data without having to fetch

        // createMany
        // createOne
        // deleteMany
        // deleteOne
        // updateMany
        // updateOne
        // upsertOne
        // upsertMany
    }
}
