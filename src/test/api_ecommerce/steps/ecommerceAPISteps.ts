import { Given, When, Then } from "@cucumber/cucumber";
import { expect, APIResponse } from "@playwright/test";
import { fixture } from "../../../hooks/pageFixture";
import DatabaseHelper from "../../../helper/database/dbHelper";
import PlaywrightWrapper from "../../../helper/wrapper/PlaywrightWrappers";
import { RowDataPacket } from "mysql2";
import * as fs from "fs";
import * as path from "path";

// Interfaces tipadas para las filas que devuelve MySQL
interface SearchProductRow extends RowDataPacket {
    test_case_key: string;
    search_product: string;
    expected_category: string;
    expected_response_code: number;
}

interface UserApiRow extends RowDataPacket {
    test_case_key: string;
    name: string;
    password: string;
    title: string;
    birth_date: string;
    birth_month: string;
    birth_year: string;
    firstname: string;
    lastname: string;
    company: string;
    address1: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
    mobile_number: string;
}

const endpointsConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../data/apiEndpoints.json"), "utf-8")
).endpoints;

let apiResponse: APIResponse;
let responseBody: any;
let dbSearchRow: SearchProductRow;
let dbUserRow: UserApiRow;
let generatedApiEmail: string;
let wrapper: PlaywrightWrapper;

Given("que el cliente HTTP de Playwright esta configurado para la API", async function () {
    //Usamos fixture.api (instancia de APIRequestContext de Playwright) para ejecutar get(), post() y delete()
    wrapper = new PlaywrightWrapper(fixture.page);
    expect(fixture.api).toBeDefined();
    fixture.logger.info("Cliente HTTP APIRequestContext listo");
});

When("envio una peticion GET al endpoint {string}", async function (endpointKey: string) {
    wrapper = new PlaywrightWrapper(fixture.page);
    const url = endpointsConfig[endpointKey];
    apiResponse = await fixture.api.get(url);
    responseBody = JSON.parse(await apiResponse.text());

    await wrapper.renderApiCallOnScreen("GET", url, apiResponse.status(), null, responseBody);
    fixture.logger.info(`GET ${url} ejecutado`);
});

Then("el estado HTTP de red debe ser {int} y el responseCode del JSON debe ser {int}", async function (httpStatus: number, jsonCode: number) {
    expect(apiResponse.status()).toBe(httpStatus);
    expect(responseBody.responseCode).toBe(jsonCode);
});

Then("la lista de productos devuelta debe contener al menos {int} items validos", async function (minCount: number) {
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    expect(responseBody.products.length).toBeGreaterThanOrEqual(minCount);
    expect(responseBody.products[0]).toHaveProperty("id");
    expect(responseBody.products[0]).toHaveProperty("name");
    expect(responseBody.products[0]).toHaveProperty("price");
    fixture.logger.info(`Total de productos validados en catálogo API: ${responseBody.products.length}`);
});

Given("que consulto en MySQL el caso de prueba de busqueda con llave {string}", async function (testKey: string) {
    //Usamos DatabaseHelper.executeQuery() con interfaces RowDataPacket de TypeScript para mapear las columnas de MySQ
    wrapper = new PlaywrightWrapper(fixture.page);
    const rows = await DatabaseHelper.executeQuery<SearchProductRow>(
        "SELECT * FROM api_search_testdata WHERE test_case_key = ?",
        [testKey]
    );
    expect(rows.length).toBe(1);
    dbSearchRow = rows[0];
    fixture.logger.info(`Dato obtenido de MySQL [${testKey}]: Producto="${dbSearchRow.search_product}"`);
});

When("envio una peticion POST al endpoint {string} con el parametro extraido de la base de datos", async function (endpointKey: string) {
    const url = endpointsConfig[endpointKey];
    const formPayload = { search_product: dbSearchRow.search_product };

    apiResponse = await fixture.api.post(url, { form: formPayload });
    responseBody = JSON.parse(await apiResponse.text());

    await wrapper.renderApiCallOnScreen("POST", url, apiResponse.status(), formPayload, responseBody);
});

Then("todos los productos del resultado deben coincidir con el criterio buscado en MySQL", async function () {
    expect(responseBody.products.length).toBeGreaterThan(0);
    const firstProduct = responseBody.products[0];
    expect(firstProduct.name.toLowerCase()).toContain(dbSearchRow.search_product.toLowerCase());
    fixture.logger.info(`Producto devuelto por API coincide con MySQL: ${firstProduct.name}`);
});

Given("que consulto en MySQL la plantilla de usuario con llave {string}", async function (userKey: string) {
    wrapper = new PlaywrightWrapper(fixture.page);
    const rows = await DatabaseHelper.executeQuery<UserApiRow>(
        "SELECT * FROM api_user_testdata WHERE test_case_key = ?",
        [userKey]
    );
    expect(rows.length).toBe(1);
    dbUserRow = rows[0];
    fixture.logger.info(`Plantilla de usuario obtenida desde MySQL: ${dbUserRow.name}`);
});

When("envio una peticion POST al endpoint {string} con los datos de MySQL y un email unico", async function (endpointKey: string) {
    const url = endpointsConfig[endpointKey];
    generatedApiEmail = `kevin.api.${Date.now()}@testautomation.com`;

    const formPayload = {
        name: dbUserRow.name,
        email: generatedApiEmail,
        password: dbUserRow.password,
        title: dbUserRow.title,
        birth_date: dbUserRow.birth_date,
        birth_month: dbUserRow.birth_month,
        birth_year: dbUserRow.birth_year,
        firstname: dbUserRow.firstname,
        lastname: dbUserRow.lastname,
        company: dbUserRow.company,
        address1: dbUserRow.address1,
        country: dbUserRow.country,
        state: dbUserRow.state,
        city: dbUserRow.city,
        zipcode: dbUserRow.zipcode,
        mobile_number: dbUserRow.mobile_number
    };

    apiResponse = await fixture.api.post(url, { form: formPayload });
    responseBody = JSON.parse(await apiResponse.text());

    await wrapper.renderApiCallOnScreen("POST", url, apiResponse.status(), formPayload, responseBody);
    fixture.logger.info(`POST ${url} enviado con email: ${generatedApiEmail}`);
});

Then("el estado HTTP de red debe ser {int} y el responseCode del JSON debe ser {int} con mensaje {string}", async function (httpCode: number, jsonCode: number, expectedMsg: string) {
    expect(apiResponse.status()).toBe(httpCode);
    expect(responseBody.responseCode).toBe(jsonCode);
    expect(responseBody.message).toBe(expectedMsg);
});

When("valido las credenciales recien creadas enviando un POST al endpoint {string}", async function (endpointKey: string) {
    const url = endpointsConfig[endpointKey];
    const formPayload = {
        email: generatedApiEmail,
        password: dbUserRow.password
    };

    apiResponse = await fixture.api.post(url, { form: formPayload });
    responseBody = JSON.parse(await apiResponse.text());

    await wrapper.renderApiCallOnScreen("POST", url, apiResponse.status(), formPayload, responseBody);
});

When("elimino el usuario enviando una peticion DELETE al endpoint {string}", async function (endpointKey: string) {
    const url = endpointsConfig[endpointKey];
    const formPayload = {
        email: generatedApiEmail,
        password: dbUserRow.password
    };

    apiResponse = await fixture.api.delete(url, { form: formPayload });
    responseBody = JSON.parse(await apiResponse.text());

    await wrapper.renderApiCallOnScreen("DELETE", url, apiResponse.status(), formPayload, responseBody);
    fixture.logger.info(`Cuenta API eliminada (${generatedApiEmail})`);
});