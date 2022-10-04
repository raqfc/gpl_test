import { Field, InputType } from "type-graphql";
import { Appointment } from "../../../models/Appointment";

@InputType()
export class CreateAppointmentInput implements Partial<Appointment> {//verifica o tipo na classe e n deixa eu mudar na herança
    @Field()
    customerId: string;

    @Field()
    description: string;

    @Field()
    startsAt: Date;

    @Field()
    endsAt: Date;
}