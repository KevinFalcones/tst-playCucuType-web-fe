//This TS block google ads so that test run faster
import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { Browser, BrowserContext, chromium, request } from "@playwright/test";
import { fixture } from "./pageFixture";
import { getEnv } from "../helper/env/env";
import { createLogger } from "winston";
import { options } from "../helper/util/logger";
import DatabaseHelper from "../helper/database/dbHelper";

setDefaultTimeout(60 * 1000);

let browser: Browser;
let context: BrowserContext;

BeforeAll(async function () {
    getEnv();
    const isHeadless = process.env.HEADLESS === "true";
    const slowMoMs = Number(process.env.SLOW_MO) || 0;

    browser = await chromium.launch({
        headless: isHeadless,
        slowMo: slowMoMs // Retrasa cada interacción de Playwright automáticamente
    });
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
    const pauseMs = Number(process.env.STEP_PAUSE) || 0;

    // Mantiene la pantalla visible al final del escenario para inspección visual
    if (pauseMs > 0 && fixture.page) {
        await fixture.page.waitForTimeout(pauseMs);
    }

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
    await DatabaseHelper.closePool();//to close pool db
    await browser.close();
});