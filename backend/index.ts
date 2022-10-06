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

import { PubSub } from 'graphql-subscriptions';

import { resolvers } from "./prisma/generated/type-graphql";
import { CustomAppointmentsResolver } from "./src/resolvers/CustomAppointmentsResolver";

import pgPool from "./src/db/db"

async function startApolloServer() {
    const app = express();
    const httpServer = http.createServer(app);

    const pubSub = new PubSub();

    const schema = await buildSchema({
        resolvers: [CustomAppointmentsResolver, ...resolvers],
        emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
        pubSub: pubSub
    });

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({
        schema,
        onConnect: async (ctx) => {
            console.log('onConnect!');
            // console.log("ctx", ctx);
            // console.log('--');
            // if (tokenIsNotValid(ctx.connectionParams)) {
            //     throw new Error('Auth token missing!');
            // }
            return { extended: 'context' };
        },
        onDisconnect(ctx, code, reason) {
            console.log('onDisconnect!');
            // console.log('--');
        },
        context: async (ctx, message, args) => {
            // If we build the context for subscriptions, return the context generated in the onConnect callback.
            // In this example `connection.context` is `{ extended: 'context' }`
            console.log('context!');
            // console.log("ctx", ctx.connectionParams);

            // console.log('--');
            // if (!req || !req.headers) {
            //     return connection.context;
            // }
            //
            // // Build context for normal requests
            return ctx;
        },
    }, wsServer);

    const prisma = new PrismaClient();

    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: 'bounded',
        context: () => ({
            prisma,
            pubSub
        }),
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

    /////////////////////////////////////////////////////////////////
    //testing pg subscription
    await pgPool.connect((err, client) =>{
        // Listen for all pg_notify channel messages
        if(err) {
            console.log("Error connecting Postgres-pg instance",err)
        } else {
            console.log("client",client)
            client.on('notification', function(msg) {
                console.log("notification")
                console.log("msg.payload", msg.payload)
                // if (typeof msg.payload === "string") {
                //     let payload = JSON.parse(msg.payload);
                // }

            });

            // Designate which channels we are listening on. Add additional channels with multiple lines.
            client.query('LISTEN new_order');
        }
    })

    //precisa do `wal_level` >= logical configurado no postgres
    // await pg.subscribe('insert', (row, info) => {
    //     console.log("subscriber called")
    //     console.log("row", row)
    //     console.log("info", info)
    //     console.log("--")
    //     console.log("--")
    // })
}

startApolloServer().then(r => {
});