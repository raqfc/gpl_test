import "reflect-metadata";

import path from 'path';
import { buildSchema } from "type-graphql";

import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault, } from 'apollo-server-core';
import express from 'express';
import http from 'http';

import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { PrismaClient } from "@prisma/client";

import { resolvers } from "./prisma/generated/type-graphql";

async function startApolloServer() {
    const app = express();
    const httpServer = http.createServer(app);

    const schema = await buildSchema({
        resolvers: resolvers,//[UserResolver, AppointmentsResolver, ...resolvers],
        emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
    });

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({schema}, wsServer);

    const prisma = new PrismaClient();
    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: 'bounded',
        context: () => ({prisma}),
        plugins: [
            ApolloServerPluginDrainHttpServer({httpServer}),
            ApolloServerPluginLandingPageLocalDefault({embed: true}),
            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });

    await server.start();
    server.applyMiddleware({app});
    await new Promise<void>(resolve => httpServer.listen({port: 4000}, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer().then(r => {
});