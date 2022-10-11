import fs, { ReadStream } from 'fs'
import readline from 'readline'
import { AuthMiddleware } from "../middlewares/auth/AuthMiddleware";

export async function generateAuthMiddlewareSchemaHelper(authMiddleware: AuthMiddleware): Promise<any> {
    try {
        const fileStream = fs.createReadStream(__dirname+ '/../../schema.gql', { encoding: 'utf8' });

        let middlewareSchema: any = await findObjects(["Query", "Mutation", "Subscription"], authMiddleware.middleware, fileStream)
        console.log(middlewareSchema);

        return middlewareSchema
    } catch (err) {
        console.log(err);
    }
    return {}
}

async function findObjects(objectsNames: string[], valueToAdd: any,  fileStream: ReadStream): Promise<any> {
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let foundStart = false
    let currentObject: string|null = null

    let myObject: any = {}
    for (const name of objectsNames) {
        myObject[name] = {}
    }

    //read line by line
    for await (const line of rl) {
        //verify if the current line is the init of a type block of the desired name
        for (const name of objectsNames) {
            if(line.match(`type ${name} {`)) {//eg. if line matches 'type Query {'
                foundStart = true
                currentObject = name
                break
            }
        }

        if(foundStart && line.match('}')) { //if is and block end, clear current object
            foundStart = false
            currentObject = null
        }

        if(!foundStart || !currentObject)
            continue
        //if is currently inside and desired object, try finding a key name:
        let resolverFunction = line.substring(0, line.indexOf('(')) || line.substring(0, line.indexOf(':')) //eg. 'aggregateUser(cursor: UserWhereUniqueInput): AggregateUser!'
                                                                                                            //or  'aggregateUser: AggregateUser!'
        //then with only the key name, adds it to the object
        if(resolverFunction)
            myObject[currentObject][resolverFunction.trim()] = valueToAdd
    }

    return myObject
}

//input file of type:
// type Query {
//     aggregateAppointment(cursor: AppointmentWhereUniqueInput, orderBy: [AppointmentOrderByWithRelationInput!], skip: Int, take: Int, where: AppointmentWhereInput): AggregateAppointment!
//     aggregateProcedure(cursor: ProcedureWhereUniqueInput, orderBy: [ProcedureOrderByWithRelationInput!], skip: Int, take: Int, where: ProcedureWhereInput): AggregateProcedure!
//     aggregateUser(cursor: UserWhereUniqueInput): AggregateUser!
// }
// type Mutation {
//     aggregateAppointment(cursor: AppointmentWhereUniqueInput, orderBy: [AppointmentOrderByWithRelationInput!], skip: Int, take: Int, where: AppointmentWhereInput): AggregateAppointment!
//     aggregateProcedure(cursor: ProcedureWhereUniqueInput, orderBy: [ProcedureOrderByWithRelationInput!], skip: Int, take: Int, where: ProcedureWhereInput): AggregateProcedure!
//     aggregateUser(cursor: UserWhereUniqueInput, orderBy: [UserOrderByWithRelationInput!], skip: Int, take: Int, where: UserWhereInput): AggregateUser!
// }
// type Subscription {
//     aggregateAppointment(cursor: AppointmentWhereUniqueInput, orderBy: [AppointmentOrderByWithRelationInput!], skip: Int, take: Int, where: AppointmentWhereInput): AggregateAppointment!
//     aggregateProcedure(cursor: ProcedureWhereUniqueInput, orderBy: [ProcedureOrderByWithRelationInput!], skip: Int, take: Int, where: ProcedureWhereInput): AggregateProcedure!
//     observeUser: AggregateUser!
// }
//expected result of type:
// {
//     Query: {
//         aggregateAppointment: this.middleware,
//         aggregateProcedure: this.middleware,
//     },
//     Mutation: {
//         createManyAppointment: this.middleware,
//         createManyProcedure: this.middleware,
//     },
//     Subscription: {
//         observeNewUser: this.middleware,
//         observeUser: this.middleware,
//     }
// }