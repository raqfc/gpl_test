import {
    Args,
    ArgsType,
    Ctx,
    Info,
    Mutation,
    Publisher,
    PubSub,
    PubSubEngine,
    Resolver,
    Root,
    Subscription
} from "type-graphql";
import { GraphQLResolveInfo, subscribe } from "graphql";
import { Appointment, FindManyAppointmentArgs } from "../../prisma/generated/type-graphql";
import { getPrismaFromContext } from "../../prisma/generated/type-graphql/helpers";

@ArgsType()
export class NotificationPayload {
    message?: string;
}
export const APPOINTMENTS_TOPIC = "APPOINTMENTS_TOPIC"
@Resolver(() => Appointment)
export class CustomAppointmentsResolver {



    @Subscription({
        topics: APPOINTMENTS_TOPIC,
    })
    observeManyAppointments(@Ctx() ctx: any, @PubSub() pubSub: PubSubEngine, @Root() notificationPayload: NotificationPayload): string {
        console.log("ctx", ctx)
        console.log("pubSub", pubSub)

        // console.log("root", root)
        console.log("notificationPayload", notificationPayload)

        return notificationPayload.message ?? "a"

        // const { _count } = transformFields(
        //     graphqlFields(info as any)
        // );
        // return getPrismaFromContext(ctx).appointment.findMany({
        //     ...args,
        //     ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
        // }).subscribe();


        // return getPrismaFromContext(ctx).appointment.findMany({
        //     ...args,
        //     ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
        // });
    }
    //
    // @Subscription({
    //     subscribe: (rootValue, args, context, info) => {
    //         getPrismaFromContext(context).
    //     }
    // })
    // observeDb(@Ctx() ctx: any, @Root() notificationPayload: NotificationPayload) {
    //
    // }


    @Mutation(() => String)
    async test(@Ctx() ctx: any,  @PubSub(APPOINTMENTS_TOPIC) publish: Publisher<NotificationPayload>,) {
        // console.log("pubsub", ctx.pubSub)
        console.log("publicando")
        const payload: NotificationPayload = { message: "att aq" };
        await publish(payload);
        return 'OK';
    }

}