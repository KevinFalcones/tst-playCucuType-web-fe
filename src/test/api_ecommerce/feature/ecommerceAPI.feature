Feature: Pruebas de Integracion Backend sobre la API REST de Automation Exercise
  Como ingeniero de automatizacion QA
  Quiero validar los endpoints GET, POST y DELETE del backend consumiendo datos desde MySQL
  Para garantizar la integridad de los servicios REST y contratos JSON del e-commerce

  @api @smoke
  Scenario: Obtener la lista completa del catalogo de productos mediante GET
    Given que el cliente HTTP de Playwright esta configurado para la API
    When envio una peticion GET al endpoint "productsList"
    Then el estado HTTP de red debe ser 200 y el responseCode del JSON debe ser 200
    And la lista de productos devuelta debe contener al menos 30 items validos

  @api @mysql @regression
  Scenario Outline: Buscar productos mediante POST consumiendo datos de prueba desde MySQL
    Given que consulto en MySQL el caso de prueba de busqueda con llave "<db_key>"
    When envio una peticion POST al endpoint "searchProduct" con el parametro extraido de la base de datos
    Then el estado HTTP de red debe ser 200 y el responseCode del JSON debe ser <expected_code>
    And todos los productos del resultado deben coincidir con el criterio buscado en MySQL

    Examples:
      | db_key        | expected_code |
      | SEARCH_TOP    | 200           |
      | SEARCH_TSHIRT | 200           |

  @api @mysql @e2e
  Scenario: Ciclo completo de Usuario via API (POST Create, POST Login y DELETE) con datos desde MySQL
    Given que consulto en MySQL la plantilla de usuario con llave "API_USER_01"
    When envio una peticion POST al endpoint "createAccount" con los datos de MySQL y un email unico
    Then el estado HTTP de red debe ser 200 y el responseCode del JSON debe ser 201 con mensaje "User created!"
    When valido las credenciales recien creadas enviando un POST al endpoint "verifyLogin"
    Then el estado HTTP de red debe ser 200 y el responseCode del JSON debe ser 200 con mensaje "User exists!"
    When elimino el usuario enviando una peticion DELETE al endpoint "deleteAccount"
    Then el estado HTTP de red debe ser 200 y el responseCode del JSON debe ser 200 con mensaje "Account deleted!"