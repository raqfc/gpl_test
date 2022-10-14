export class MetaMiddleware {
    middleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
        if (info.operation.operation.toLowerCase() !== 'mutation') {
            return await resolve(root, args, context, info)
        }

        // context.decodedAuthToken
        // context.table

        const data = await resolve(root, args, context, info)

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