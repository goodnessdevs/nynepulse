export default () => ({
    database: {
        connectionString: process.env.DATABASE_URL
    },
    redis: {
        connectionUrl: process.env.REDIS_URL
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        exp: process.env.JWT_EXPIRY,
    },
    environment: process.env.NODE_ENV,
    origins: {
        clientUrl: process.env.CLIENT_URL
    }
})