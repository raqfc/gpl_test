import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../models/User";
import crypto from 'crypto';

//query: busca dados

//mutation: criar/alterar/deletar dados

@Resolver()
export class UserResolver {
    private data: User[] = [];

    @Query(() => [User])
    async users() {
        return this.data
    }

    @Mutation(() => User)
    async createUser(@Arg('name') name: string) {
        const user: User = {
            id: crypto.randomUUID(),
            name: name
        }
        this.data.push(user)

        return user;
    }
}