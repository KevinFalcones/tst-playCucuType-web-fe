import * as dotenv from 'dotenv';
import * as path from 'path';

export const getEnv = () => {
    const env = process.env.ENV || 'qa';
    dotenv.config({
        override: true,
        path: path.resolve(__dirname, `.env.${env}`)
    });
};