import { Args, Ctx, Info, Mutation, Resolver, Subscription } from "type-graphql";
import { GraphQLResolveInfo, subscribe } from "graphql";
import { Appointment, FindManyAppointmentArgs } from "../../prisma/generated/type-graphql";
import { getPrismaFromContext } from "../../prisma/generated/type-graphql/helpers";

@Resolver(() => Appointment)
export class CustomAppointmentsResolver {

    @Subscription({
        topics: "alo"
    })
    observeManyAppointments(@Ctx() ctx: any): string {
        return ctx.pubSub.asyncIterator("alo")

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

    @Mutation(() => String)
    test(@Ctx() ctx: any) {
        ctx.pubSub.publish("alo", { somethingChanged: { id: "123" }});
        return 'OK';
    }

}