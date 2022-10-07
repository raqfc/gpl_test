import { PoolClient } from "pg";
import {
    UserUpdatedNotificationPayload
} from "../resolvers/subscriptions/User/args/UserUpdatedNotificationPayload";
import { User } from "../../prisma/generated/type-graphql";
import { APPOINTMENTS_TOPIC, USERS_TOPIC } from "../resolvers/subscriptions/SubscriptionTopics";
import { PubSubEngine } from "graphql-subscriptions/dist/pubsub-engine";
import { databaseTriggers, NEW_USER_TRIGGER, UPDATED_USER_TRIGGER } from "./DatabaseTriggers";
import { UserModel } from "../models/UserModel";

export class DatabaseTriggerListener {
    client: PoolClient
    pubSub: PubSubEngine

    constructor(client: PoolClient, pubSub: PubSubEngine) {
        this.client = client;
        this.pubSub = pubSub;
        this.startListener()
    }

    startListener() {
        this.client.on('notification', (msg) => {
            console.log("notification");
            //EXAMPLE
            // msg NotificationResponseMessage {
            //         length: 123,
            //         processId: 519,
            //         channel: 'new_user',
            //         payload: '{"id":"86e005ac-c250-4ccb-bd19-c96216b7a1c9","email":"testemail7@gmail.com","name":"user7","role":"USER"}',
            //         name: 'notification'
            // }
            if (msg.payload) {
                console.log("msg.payload", msg.payload);
                const payloadInfo = JSON.parse(msg.payload);
                switch (msg.channel) {
                    case NEW_USER_TRIGGER:
                        const newUser: UserUpdatedNotificationPayload = {user: new UserModel(payloadInfo)};
                        this.pubSub.publish(USERS_TOPIC, newUser).then(r => {});
                        break;
                    case UPDATED_USER_TRIGGER:
                        const updateUser: UserUpdatedNotificationPayload = {user: new UserModel(payloadInfo)};
                        this.pubSub.publish(`${USERS_TOPIC}-${updateUser.user?.id}`, updateUser).then(r => {});
                        break;
                    default:
                        break;
                }
            }
        });

        this.activateTriggers()
    }

    activateTriggers() {
        // Designate which channels we are listening on. Add additional channels with multiple lines.
        for(const trigger of databaseTriggers) {
            console.log(`listening for trigger: ${trigger}`)
            this.client.query(`LISTEN ${trigger}`).then(() => {});
        }
    }
}