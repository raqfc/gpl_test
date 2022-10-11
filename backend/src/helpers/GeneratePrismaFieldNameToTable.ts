import "reflect-metadata";
import * as fs from 'fs/promises'
import * as resolvers from '../../prisma/generated/type-graphql/resolvers/crud/resolvers-crud.index'

export async function generatePrismaFieldNameToTable(): Promise<void> {
    try {
        let tableMethods: any = {}
        const resolvers2: any = resolvers;//by FCM
        for (const resolver in resolvers as any) {
            const classDef = new resolvers2[resolver]
            let methods = Reflect.ownKeys(Object.getPrototypeOf(classDef))

            const index = methods.indexOf("constructor");
            if (index > -1) { // only splice array when item is found
                methods.splice(index, 1); // 2nd parameter means remove one item only
            }


            const tableName = resolver.split("CrudResolver").shift()
            if (tableName)
                tableMethods[tableName] = methods

        }

        await fs.mkdir(__dirname + '/generated', {recursive: true})
        await fs.writeFile(__dirname + '/generated/GTableMethods.js', `export const GTableMethods = ${JSON.stringify(tableMethods, null, 4)}`);
    } catch (err) {
        console.log(err);
    }
}