import { Field, InputType } from "type-graphql";

@InputType()
export class CreateAppointmentInput {
    @Field()
    customerId: string;

    @Field()
    description: string;

    @Field()
    startsAt: Date;

    @Field()
    endsAt: Date;
}