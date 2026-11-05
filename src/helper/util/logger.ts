//Util for loggin each step into path /test-results/logs/
import { transports, format, createLogger } from "winston";

export function options(scenarioName: string) {
    return {
        transports: [
            new transports.Console({
                level: 'info',
                format: format.combine(
                    format.colorize(),
                    format.printf(({ level, message }) => `[${level}]: ${message}`)
                )
            }),
            new transports.File({
                filename: `test-results/logs/${scenarioName}.log`,
                level: 'info',
                maxsize: 5242880,
                format: format.combine(
                    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    format.align(),
                    format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
                )
            }),
        ]
    };
}