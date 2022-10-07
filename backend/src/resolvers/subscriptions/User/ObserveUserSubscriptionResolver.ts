import { Args, Ctx, PubSub, PubSubEngine, Resolver, Root, Subscription } from "type-graphql";
import { Appointment } from "../../../../prisma/generated/type-graphql";
import { UserUpdatedNotificationPayload } from "./args/UserUpdatedNotificationPayload";
import { USERS_TOPIC } from "../SubscriptionTopics";
import { UpdatedUser } from "../../outputs/UpdatedUser";
import { ObserveUserArgs } from "./args/ObserveUserArgs";


@Resolver(() => Appointment)
export class ObserveUserSubscriptionResolver {

    @Subscription({
        topics: ({args, payload, context}) => `${USERS_TOPIC}-${args.id}`
    })
    observeUser(@Ctx() ctx: any, @Args() args: ObserveUserArgs, @PubSub() pubSub: PubSubEngine, @Root() notificationPayload: UserUpdatedNotificationPayload): UpdatedUser {
        console.log("notificationPayload", notificationPayload)
        return {
            user: notificationPayload.user,
            message: !notificationPayload.user ? "error obtaining user" : "success"
        }
    }
    @Subscription({
        topics: USERS_TOPIC
    })
    observeNewUser(@Ctx() ctx: any, @PubSub() pubSub: PubSubEngine, @Root() notificationPayload: UserUpdatedNotificationPayload): UpdatedUser {
        console.log("notificationPayload", notificationPayload)
        return {
            user: notificationPayload.user,
            message: !notificationPayload.user ? "error obtaining user" : "success"
        }
    }

    // @Mutation(() => String)
    // async test(@Ctx() ctx: any,  @PubSub(APPOINTMENTS_TOPIC) publish: Publisher<NotificationPayload>,) {
    //     console.log("publicando")
    //     const payload: NotificationPayload = { message: "att aq" };
    //     await publish(payload);
    //     return 'OK';
    // }

}