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
        const element = this.page.locator(locator).first();
        await element.waitFor({ state: "visible" });
        await element.scrollIntoViewIfNeeded();
        await element.click();
    }

    async fillText(locator: string, text: string) {
        const element = this.page.locator(locator).first();
        await element.waitFor({ state: "visible" });
        await element.scrollIntoViewIfNeeded();
        await element.fill(text);
    }

    // Muestra visualmente en el navegador las peticiones y respuestas de los tests de API
    async renderApiCallOnScreen(method: string, endpoint: string, status: number, payload: any, responseJson: any) {
        if (process.env.HEADLESS === "true") return;

        const html = `
        <html>
        <body style="background:#0f172a; color:#e2e8f0; font-family:Consolas, monospace; padding:24px;">
            <h2 style="color:#38bdf8; margin-top:0;">🚀 Playwright API Inspector (Live Execution)</h2>
            <div style="background:#1e293b; padding:16px; border-radius:8px; border-left: 5px solid #22c55e; margin-bottom:16px;">
                <span style="background:#2563eb; color:white; padding:4px 10px; border-radius:4px; font-weight:bold;">${method}</span>
                <span style="font-size:18px; margin-left:12px; color:#f8fafc;">${endpoint}</span>
                <span style="float:right; color:#4ade80; font-weight:bold;">HTTP Status: ${status}</span>
            </div>
            <div style="display:flex; gap:16px;">
                <div style="flex:1; background:#1e293b; padding:16px; border-radius:8px;">
                    <h4 style="color:#fbbf24; margin-top:0;">📤 Payload Enviado / Datos desde MySQL:</h4>
                    <pre style="white-space:pre-wrap; color:#cbd5e1; font-size:13px;">${JSON.stringify(payload || { info: "Sin Body (GET)" }, null, 2)}</pre>
                </div>
                <div style="flex:2; background:#1e293b; padding:16px; border-radius:8px; max-height:480px; overflow:auto;">
                    <h4 style="color:#34d399; margin-top:0;">📥 Respuesta JSON Recibida:</h4>
                    <pre style="white-space:pre-wrap; color:#a7f3d0; font-size:13px;">${JSON.stringify(responseJson, null, 2).slice(0, 2500)}</pre>
                </div>
            </div>
        </body>
        </html>`;

        await this.page.setContent(html);
        const pauseMs = Number(process.env.STEP_PAUSE) || 1200;
        await this.page.waitForTimeout(pauseMs);
    }
}