import { Appointment, Role, User } from "../../prisma/generated/type-graphql";
import { Field, ObjectType } from "type-graphql";

@ObjectType("User")
export class UserModel extends User{

    constructor(payload: any) {
        super()
        this.id = payload.id
        this.email = payload.email
        this.name = payload.name
        this.role = payload.role
        this.supervisedAppointments = payload.supervisedAppointments
        this.appointments = payload.appointments
    }
}
