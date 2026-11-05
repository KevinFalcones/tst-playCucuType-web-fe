Feature: Flujos E2E de Interfaz de Usuario en Automation Exercise
  Como cliente del portal de e-commerce Automation Exercise
  Quiero poder registrarme, autenticarme y agregar productos al carrito
  Para validar que los flujos críticos del Frontend funcionan correctamente

  Background:
    Given que el usuario navega a la pagina principal de Automation Exercise

  @ui @smoke
  Scenario: Registro exitoso de un nuevo usuario y eliminacion de cuenta (Idempotente)
    When el usuario accede a la seccion "Signup / Login"
    And ingresa un nombre y correo dinamico utilizando los datos de "userData.json"
    And completa el formulario de registro con la informacion de cuenta y direccion
    Then deberia ver el mensaje de confirmacion "Account Created!"
    When hace clic en continuar y verifica que la sesion inicio con su nombre de usuario
    Then elimina la cuenta creada y valida el mensaje "Account Deleted!"

  @ui @regression
  Scenario Outline: Intento de inicio de sesion con credenciales invalidas
    When el usuario accede a la seccion "Signup / Login"
    And intenta iniciar sesion con el correo "<email>" y la contrasena "<password>"
    Then deberia mostrarse el mensaje de error "<error_message>"

    Examples:
      | email                        | password      | error_message                            |
      | usuario_inexistente@test.com | WrongPass123! | Your email or password is incorrect!     |
      | qa_invalido_99@dominio.com   | 123456        | Your email or password is incorrect!     |

  @ui @e2e
  Scenario: Busqueda de prenda en el catalogo y adicion al carrito de compras
    When el usuario navega a la seccion de "Products"
    And realiza la busqueda del producto configurado en "userData.json"
    Then deberia visualizar el producto buscado en los resultados
    When agrega el primer producto resultante al carrito y procede a "View Cart"
    Then el carrito de compras debe mostrar el producto con su precio correcto