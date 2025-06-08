<?php

// === CORS HEADERS ===
$allowedOrigins = [
    "https://whale-app-2-rytvu.ondigitalocean.app",
    "http://localhost",
    "http://127.0.0.1"
];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Headers: Content-Type, Authentication, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// === ERROR REPORTING ===
ini_set('display_errors', 1);
error_reporting(E_ALL);

// === AUTOLOAD ===
require_once __DIR__ . '/../../../vendor/autoload.php';

// === BASE_URL ===
if ($_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == '127.0.0.1') {
    define('BASE_URL', 'http://localhost/MonaOmeragic/Web-programming/backend');
} else {
    define('BASE_URL', 'https://whale-app-2-rytvu.ondigitalocean.app/');
}

// === GENERATE OPENAPI DOCS ===
use OpenApi\Generator;

$openapi = Generator::scan([
    __DIR__ . '/doc_setup.php',
    __DIR__ . '/../../../routes'
]);

header('Content-Type: application/json');
echo $openapi->toJson();