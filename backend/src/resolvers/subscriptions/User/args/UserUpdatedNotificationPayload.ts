import { ArgsType } from "type-graphql";
import { User } from "../../../../../prisma/generated/type-graphql";

@ArgsType()
export class UserUpdatedNotificationPayload {
    user?: User
    error?: string
}