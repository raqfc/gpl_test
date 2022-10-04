import "reflect-metadata";

import path from 'path';
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server";
import { UserResolver } from "./src/resolvers/UserResolver";
import { AppointmentsResolver } from "./src/resolvers/AppointmentsResolver";

async function main() {
    const schema = await buildSchema({
        resolvers: [UserResolver, AppointmentsResolver],
        emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
    });

    const server = new ApolloServer({
        schema,
        cors: {
            origin: '*',
            credentials: true
        }
    });

    const { url } = await server.listen();
    console.log(`Server running on ${url}`);
}

let promise = main();