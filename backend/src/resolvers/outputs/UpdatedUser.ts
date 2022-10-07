import * as TypeGraphQL from "type-graphql";
import { User } from "../../../prisma/generated/type-graphql";

@TypeGraphQL.ObjectType("UpdatedUser")
export class UpdatedUser {
    @TypeGraphQL.Field(_type => User, {
        nullable: true
    })
    user?: User;

    @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
        nullable: true
    })
    message?: string;
}
