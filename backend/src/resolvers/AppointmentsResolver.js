"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Appointment_1 = require("../dtos/models/Appointment");
const CreateAppointmentInput_1 = require("./mutations/inputs/CreateAppointmentInput");
const crypto_1 = __importDefault(require("crypto"));
const Customer_1 = require("../dtos/models/Customer");
let AppointmentsResolver = class AppointmentsResolver {
    constructor() {
        this.data = [];
    }
    async appointments() {
        return this.data;
    }
    async createAppointment(input) {
        const appointment = {
            id: crypto_1.default.randomUUID(),
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            description: input.description
        };
        this.data.push(appointment);
        return appointment;
    }
    // @Field()
    async customer(appointment) {
        console.log(appointment);
        return {
            id: crypto_1.default.randomUUID(),
            name: "cliente"
        };
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [Appointment_1.Appointment]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppointmentsResolver.prototype, "appointments", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Appointment_1.Appointment),
    __param(0, (0, type_graphql_1.Arg)('appointment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAppointmentInput_1.CreateAppointmentInput]),
    __metadata("design:returntype", Promise)
], AppointmentsResolver.prototype, "createAppointment", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => Customer_1.Customer),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Appointment_1.Appointment]),
    __metadata("design:returntype", Promise)
], AppointmentsResolver.prototype, "customer", null);
AppointmentsResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Appointment_1.Appointment)
], AppointmentsResolver);
exports.AppointmentsResolver = AppointmentsResolver;
