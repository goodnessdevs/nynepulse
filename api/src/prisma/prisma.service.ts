import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private logger = new Logger(PrismaService.name)

    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL as string,
        });
        super({ adapter });
    }

    async onModuleInit() {
        this.$connect()
        this.logger.debug('Server connected to database')
    }

    async onModuleDestroy() {
        this.$disconnect()
        this.logger.debug('Server disconnected from database')
    }
}