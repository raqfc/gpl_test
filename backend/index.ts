import "reflect-metadata";

import path from 'path';
// import {
//     ResolversEnhanceMap,
//     applyResolversEnhanceMap,
// } from "@generated/type-graphql";
import { buildSchema } from "type-graphql";

import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault, } from 'apollo-server-core';
import express from 'express';
import http from 'http';

import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { PubSub } from 'graphql-subscriptions';

import { resolvers } from "./prisma/generated/type-graphql";
import { ObserveUserSubscriptionResolver, } from "./src/resolvers/subscriptions/User/ObserveUserSubscriptionResolver";

import pgPool from "./src/db/db"
import { DatabaseTriggerListener } from "./src/db/DatabaseTriggerListener";
import { applyMiddleware } from "graphql-middleware";

import admin from "firebase-admin";

import { AuthMiddleware } from "./src/middlewares/auth/AuthMiddleware";
import { generateAuthMiddlewareSchemaHelper } from "./src/helpers/GenerateAuthMiddlewareSchemaHelper";
import { generatePrismaFieldNameToTable } from "./src/helpers/GeneratePrismaFieldNameToTable";
import prisma from "./src/client";
import { FirebaseIAuth } from "./src/middlewares/auth/FirebaseIAuth";
import { MetaMiddleware } from "./src/middlewares/meta/MetaMiddleware";
import client from "./src/client";


// const testMiddleware: MiddlewareFn<any> = ({ context, info }, next) => {
//     console.log(`context -> ${context}`);
//     return next();
// };
async function startApolloServer() {
    const app = express();
    const httpServer = http.createServer(app);

    const pubSub = new PubSub();

    // const resolversEnhanceMap: ResolversEnhanceMap = {
    //     User: {
    //         _all: [UseMiddleware(testMiddleware)],
    //     },
    // };
    //
    // applyResolversEnhanceMap(resolversEnhanceMap);

    let schema = await buildSchema({
        resolvers: [ObserveUserSubscriptionResolver, ...resolvers],
        emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
        pubSub: pubSub
    });

    //init firebaseAdmin
    const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '')
    const firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://volandevjw-default-rtdb.firebaseio.com"
    });

    const authMiddleware = new AuthMiddleware(new FirebaseIAuth(firebaseApp.auth()))

    await generatePrismaFieldNameToTable()
    // client.$use(metaMiddleware.prismaMiddleware)
    const middlewareSchema = await generateAuthMiddlewareSchemaHelper([authMiddleware.middleware, MetaMiddleware])
    schema = applyMiddleware(schema, ...middlewareSchema)


    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({
        schema,
        onConnect: async (ctx) => {
            console.log('onConnect!');
            const validatedToken = await authMiddleware.checkValidToken(ctx.connectionParams?.Authorization as string|null)
            if (!validatedToken) {
                //todo descobrir como deixar retornar false
                // return false//new Error or('Auth token missing!');
            } else {
                return {extended: 'context'};
            }
        },
        onDisconnect(ctx, code, reason) {
            console.log('onDisconnect!');
            // console.log('--');
        },
        context: async (ctx, message, args) => {
            // If we build the context for subscriptions, return the context generated in the onConnect callback.
            // In this example `connection.context` is `{ extended: 'context' }`
            console.log('context!');
            return ctx;
        },
    }, wsServer);


    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: 'bounded',
        context: ({req, res}) => ({
            authToken: req.headers.authorization,
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
    console.log(`???? Server ready at http://localhost:4000${server.graphqlPath}`);

    /////////////////////////////////////////////////////////////////
    //testing pg subscription
    pgPool.connect((err, client) => {
        // Listen for all pg_notify channel messages
        if (err) {
            console.log("Error connecting Postgres-pg instance", err);
        } else {
            new DatabaseTriggerListener(client, pubSub)
        }
    })

}

startApolloServer().then(r => {
});