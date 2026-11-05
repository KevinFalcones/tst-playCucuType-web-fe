import { Page, APIRequestContext } from "@playwright/test";
import { Logger } from "winston";

export const fixture = {
    // @ts-ignore
    page: undefined as Page,
    // @ts-ignore
    api: undefined as APIRequestContext,
    // @ts-ignore
    logger: undefined as Logger
};