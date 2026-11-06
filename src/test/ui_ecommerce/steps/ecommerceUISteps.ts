import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../../hooks/pageFixture";
import PlaywrightWrapper from "../../../helper/wrapper/PlaywrightWrappers";
import * as fs from "fs";
import * as path from "path";

// Definición de Interfaces en TypeScript para tipado fuerte del JSON
interface UserTestData {
    newUser: {
        name: string;
        password: string;
        firstName: string;
        lastName: string;
        company: string;
        address: string;
        country: string;
        state: string;
        city: string;
        zipcode: string;
        mobile: string;
    };
    productSearch: {
        searchTerm: string;
        expectedPrice: string;
    };
}

let wrapper: PlaywrightWrapper;
let testData: UserTestData;

// Función auxiliar para cargar el archivo JSON con tipado seguro
function loadTestData(fileName: string): UserTestData {
    const filePath = path.resolve(__dirname, `../data/${fileName}`);
    const rawData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(rawData) as UserTestData;
}

Given("que el usuario navega a la pagina principal de Automation Exercise", async function () {
    wrapper = new PlaywrightWrapper(fixture.page);
    await wrapper.goto(process.env.BASE_URL || "https://automationexercise.com");

    // Manejo preventivo de banner de consentimiento GDPR si aparece
    const consentBtn = fixture.page.locator("button.fc-cta-consent");
    if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await consentBtn.click();
    }

    await expect(fixture.page).toHaveTitle(/Automation Exercise/);
    fixture.logger.info("Página principal cargada correctamente");
});

When("el usuario accede a la seccion {string}", async function (menuOption: string) {
    await wrapper.waitAndClick(`a:has-text("${menuOption}")`);
    fixture.logger.info(`Navegando a la sección: ${menuOption}`);
});

When("ingresa un nombre y correo dinamico utilizando los datos de {string}", async function (fileName: string) {
    testData = loadTestData(fileName);
    const uniqueEmail = `kevin.qa.${Date.now()}@testautomation.com`;

    await wrapper.fillText('input[data-qa="signup-name"]', testData.newUser.name);
    await wrapper.fillText('input[data-qa="signup-email"]', uniqueEmail);
    await wrapper.waitAndClick('button[data-qa="signup-button"]');

    fixture.logger.info(`Iniciando registro con correo dinámico: ${uniqueEmail}`);
});

When("completa el formulario de registro con la informacion de cuenta y direccion", async function () {
    const user = testData.newUser;

    await wrapper.waitAndClick("#id_gender1");
    await wrapper.fillText('input[data-qa="password"]', user.password);
    await wrapper.fillText('input[data-qa="first_name"]', user.firstName);
    await wrapper.fillText('input[data-qa="last_name"]', user.lastName);
    await wrapper.fillText('input[data-qa="company"]', user.company);
    await wrapper.fillText('input[data-qa="address"]', user.address);

    const countrySelect = fixture.page.locator('select[data-qa="country"]');
    await countrySelect.scrollIntoViewIfNeeded();
    await countrySelect.selectOption(user.country);

    await wrapper.fillText('input[data-qa="state"]', user.state);
    await wrapper.fillText('input[data-qa="city"]', user.city);
    await wrapper.fillText('input[data-qa="zipcode"]', user.zipcode);
    await wrapper.fillText('input[data-qa="mobile_number"]', user.mobile);

    await wrapper.waitAndClick('button[data-qa="create-account"]');
    fixture.logger.info("Formulario de registro enviado");
});

Then("deberia ver el mensaje de confirmacion {string}", async function (expectedMessage: string) {
    const confirmationHeader = fixture.page.locator('h2[data-qa="account-created"]');
    await expect(confirmationHeader).toBeVisible();
    await expect(confirmationHeader).toHaveText(expectedMessage);
});

When("hace clic en continuar y verifica que la sesion inicio con su nombre de usuario", async function () {
    await wrapper.waitAndClick('a[data-qa="continue-button"]');
    const loggedInText = fixture.page.locator(`a:has-text("Logged in as ${testData.newUser.name}")`);
    await expect(loggedInText).toBeVisible();
});

Then("elimina la cuenta creada y valida el mensaje {string}", async function (expectedDeletedMsg: string) {
    await wrapper.waitAndClick('a[href="/delete_account"]');
    const deletedHeader = fixture.page.locator('h2[data-qa="account-deleted"]');
    await expect(deletedHeader).toBeVisible();
    await expect(deletedHeader).toHaveText(expectedDeletedMsg);
    fixture.logger.info("Cuenta eliminada exitosamente para mantener idempotencia");
});

When("intenta iniciar sesion con el correo {string} y la contrasena {string}", async function (email: string, pass: string) {
    await wrapper.fillText('input[data-qa="login-email"]', email);
    await wrapper.fillText('input[data-qa="login-password"]', pass);
    await wrapper.waitAndClick('button[data-qa="login-button"]');
});

Then("deberia mostrarse el mensaje de error {string}", async function (expectedError: string) {
    const errorLocator = fixture.page.locator('form[action="/login"] p');
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toHaveText(expectedError);
});

When("el usuario navega a la seccion de {string}", async function (section: string) {
    await wrapper.waitAndClick(`a[href="/products"]`);
    await expect(fixture.page.locator("h2.title.text-center")).toContainText("All Products");
});

When("realiza la busqueda del producto configurado en {string}", async function (fileName: string) {
    testData = loadTestData(fileName);
    await wrapper.fillText("#search_product", testData.productSearch.searchTerm);
    await wrapper.waitAndClick("#submit_search");
    await expect(fixture.page.locator("h2.title.text-center")).toContainText("Searched Products");
});

Then("deberia visualizar el producto buscado en los resultados", async function () {
    const productCard = fixture.page.locator(".productinfo.text-center p").first();
    await expect(productCard).toBeVisible();
    await expect(productCard).toContainText(testData.productSearch.searchTerm);
});

When("agrega el primer producto resultante al carrito y procede a {string}", async function (modalAction: string) {
    await wrapper.waitAndClick(".productinfo.text-center a.add-to-cart");
    await wrapper.waitAndClick(`#cartModal a:has-text("${modalAction}")`);
});

Then("el carrito de compras debe mostrar el producto con su precio correcto", async function () {
    const cartProductName = fixture.page.locator("#cart_info_table .cart_description h4 a").first();
    const cartProductPrice = fixture.page.locator("#cart_info_table .cart_price p").first();

    await expect(cartProductName).toHaveText(testData.productSearch.searchTerm);
    await expect(cartProductPrice).toHaveText(testData.productSearch.expectedPrice);
    fixture.logger.info(`Producto validado en carrito: ${testData.productSearch.searchTerm} - ${testData.productSearch.expectedPrice}`);
});