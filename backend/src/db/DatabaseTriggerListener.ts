import { PoolClient } from "pg";
import {
    UserUpdatedNotificationPayload
} from "../resolvers/subscriptions/User/args/UserUpdatedNotificationPayload";
import { User } from "../../prisma/generated/type-graphql";
import { APPOINTMENTS_TOPIC, USERS_TOPIC } from "../resolvers/subscriptions/SubscriptionTopics";
import { PubSubEngine } from "graphql-subscriptions/dist/pubsub-engine";
import { databaseTriggers, NEW_USER_TRIGGER, UPDATED_USER_TRIGGER } from "./DatabaseTriggers";

export class DatabaseTriggerListener {
    client: PoolClient
    pubSub: PubSubEngine

    constructor(client: PoolClient, pubSub: PubSubEngine) {
        this.client = client;
        this.pubSub = pubSub;
    }

    async startListener() {
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
                        const newUser: UserUpdatedNotificationPayload = {user: new User(payloadInfo)};
                        this.pubSub.publish(USERS_TOPIC, newUser);
                        break;
                    case UPDATED_USER_TRIGGER:
                        const updateUser: UserUpdatedNotificationPayload = {user: new User(payloadInfo)};
                        this.pubSub.publish(`${USERS_TOPIC}-${updateUser.user?.id}`, updateUser);
                        break;
                    default:
                        break;
                }
            }
        });

        await this.activateTriggers()
    }

    async activateTriggers() {
        // Designate which channels we are listening on. Add additional channels with multiple lines.
        for(const trigger of databaseTriggers) {
            let result = await this.client.query(`LISTEN ${trigger}`);
            console.log(result)
        }
    }
}