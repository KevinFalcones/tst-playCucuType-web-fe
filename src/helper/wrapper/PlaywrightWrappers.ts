//This Wrapper include an google ads block
import { Page } from "@playwright/test";

export default class PlaywrightWrapper {
    constructor(private page: Page) {}

    async goto(url: string) {
        await this.page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });
    }

    async waitAndClick(locator: string) {
        const element = this.page.locator(locator);
        await element.waitFor({ state: "visible" });
        await element.click();
    }

    async fillText(locator: string, text: string) {
        const element = this.page.locator(locator);
        await element.waitFor({ state: "visible" });
        await element.fill(text);
    }
}