import { Arg, Field, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Appointment } from "../models/Appointment";
import { CreateAppointmentInput } from "./mutations/inputs/CreateAppointmentInput";
import crypto from "crypto";
import { Customer } from "../models/Customer";

@Resolver(() => Appointment)
export class AppointmentsResolver {
    private data: Appointment[] = [];

    @Query(() => [Appointment])
    async appointments() {
        return this.data;
    }

    @Mutation(() => Appointment)
    async createAppointment(@Arg('appointment') input: CreateAppointmentInput) { //@Arg('name') name: string
        const appointment: Appointment= {
            id: crypto.randomUUID(),
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            description: input.description
        }
        this.data.push(appointment);
        return appointment;
    }
    // @Field()


    @FieldResolver(() => Customer)
    async customer(@Root() appointment: Appointment) {
        console.log(appointment)
        return {
            id: crypto.randomUUID(),
            name: "cliente"
        }
    }
}