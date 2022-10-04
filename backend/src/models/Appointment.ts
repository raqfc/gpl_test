import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Appointment {
    @Field(_type =>ID)
    id: string;

    // @Field()
    // customerId: string;

    @Field()
    description: string;

    @Field()
    startsAt: Date;

    @Field()
    endsAt: Date;

}