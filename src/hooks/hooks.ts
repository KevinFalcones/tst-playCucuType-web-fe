//This TS block google ads so that test run faster
import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, chromium, request } from "@playwright/test";
import { fixture } from "./pageFixture";
import { getEnv } from "../helper/env/env";
import { createLogger } from "winston";
import { options } from "../helper/util/logger";

setDefaultTimeout(60 * 1000);

let browser: Browser;
let context: BrowserContext;

BeforeAll(async function () {
    getEnv();
    const isHeadless = process.env.HEADLESS === "true";
    browser = await chromium.launch({ headless: isHeadless });
});

Before(async function ({ pickle }) {
    const scenarioName = pickle.name.replace(/[^a-zA-Z0-9]/g, "_");
    fixture.logger = createLogger(options(scenarioName));

    context = await browser.newContext({
        baseURL: process.env.BASE_URL,
        viewport: { width: 1366, height: 768 }
    });

    const page = await context.newPage();

    // Google Ads block into automationexercise.com
    await page.route("**/*googlesyndication.com/**", route => route.abort());
    await page.route("**/*doubleclick.net/**", route => route.abort());
    await page.route("**/*googleads.g.doubleclick.net/**", route => route.abort());

    fixture.page = page;
    fixture.api = await request.newContext({
        baseURL: process.env.BASE_URL
    });

    fixture.logger.info(`Initializing scenario: ${pickle.name}`);
});

After(async function ({ pickle, result }) {
    if (result?.status === Status.FAILED && fixture.page) {
        const scenarioName = pickle.name.replace(/[^a-zA-Z0-9]/g, "_");
        const img = await fixture.page.screenshot({
            path: `./test-results/screenshots/${scenarioName}.png`,
            type: "png",
            fullPage: true
        });
        this.attach(img, "image/png");
        fixture.logger.error(`FAILED Scenario: ${pickle.name}`);
    } else {
        fixture.logger.info(`SUCCESS Scenario: ${pickle.name}`);
    }

    await fixture.page.close();
    await fixture.api.dispose();
    await context.close();
});

AfterAll(async function () {
    await browser.close();
});