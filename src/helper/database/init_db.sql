-- 1. Crear el nuevo esquema (instancia lógica de base de datos)
CREATE DATABASE IF NOT EXISTS automation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE automation_db;

-- 2. Tabla de insumos para búsqueda de productos por API
CREATE TABLE IF NOT EXISTS api_search_testdata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_case_key VARCHAR(50) NOT NULL UNIQUE,
    search_product VARCHAR(100) NOT NULL,
    expected_category VARCHAR(100) NOT NULL,
    expected_response_code INT NOT NULL
);

-- 3. Tabla de insumos para ciclo de vida de usuarios por API
CREATE TABLE IF NOT EXISTS api_user_testdata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_case_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    title VARCHAR(10) NOT NULL,
    birth_date VARCHAR(5) NOT NULL,
    birth_month VARCHAR(15) NOT NULL,
    birth_year VARCHAR(6) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    address1 VARCHAR(150) NOT NULL,
    country VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    city VARCHAR(80) NOT NULL,
    zipcode VARCHAR(20) NOT NULL,
    mobile_number VARCHAR(30) NOT NULL
);

-- 4. Insertar datos semilla (Seed Data)
INSERT INTO api_search_testdata (test_case_key, search_product, expected_category, expected_response_code)
VALUES 
    ('SEARCH_TOP', 'Blue Top', 'Women > Tops', 200),
    ('SEARCH_TSHIRT', 'Men Tshirt', 'Men > Tshirts', 200)
ON DUPLICATE KEY UPDATE search_product = VALUES(search_product);

INSERT INTO api_user_testdata (
    test_case_key, name, password, title, birth_date, birth_month, birth_year,
    firstname, lastname, company, address1, country, state, city, zipcode, mobile_number
) VALUES (
    'API_USER_01', 'Kevin Falcones API', 'ApiPass2026!', 'Mr', '15', 'May', '1995',
    'Kevin', 'Falcones', 'QA Automation Corp', 'Av. Principal 123', 'United States',
    'Florida', 'Miami', '33101', '0988888888'
) ON DUPLICATE KEY UPDATE name = VALUES(name);