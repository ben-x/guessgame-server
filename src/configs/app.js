'use strict';

const app = {
    env: process.env.NODE_ENV,
    timezone: process.env.TZ,
    port: process.env.PORT,
    name: process.env.APP_NAME,
    code: process.env.APP_CODE
};

export default app;
