//Report Generator
const report = require("multiple-cucumber-html-reporter");

report.generate({
    jsonDir: "test-results",
    reportPath: "test-results/reports/",
    reportName: "Testing Automation Exercise - By Kfalcones - Report E2E (UI & API)",
    pageTitle: "Automation Results - AutomationExercise.com",
    displayDuration: true,
    metadata: {
        browser: {
            name: "chromium",
            version: "latest",
        },
        device: "Windows 11 Local / Azure Pipeline Agent",
        platform: {
            name: "Windows",
            version: "11",
        },
    },
    customData: {
        title: "Execution Info:",
        data: [
            { label: "Project", value: "Testing Automation Exercise E2E - By Kfalcones" },
            { label: "Portal", value: "https://automationexercise.com" },
            { label: "Stack", value: "Playwright + Cucumber + TypeScript" }
        ],
    },
});