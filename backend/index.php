<?php
require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/middleware/AuthMiddleware.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// === CORS SETUP ===
$allowedOrigins = [
    "https://whale-app-2-rytvu.ondigitalocean.app",
    "https://whale-app-ecbrt.ondigitalocean.app",
    "http://localhost",
    "http://127.0.0.1"
];

// CORS preflight handling
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Authentication");
        header("Access-Control-Allow-Credentials: true");
    }
    http_response_code(200); // respond with 200 OK for preflight
    exit();
}

// Add CORS headers before each route
Flight::before('route', function () use ($allowedOrigins) {
    if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Authentication");
        header("Access-Control-Allow-Credentials: true");
    }
});

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ==== Register Services ====
require_once __DIR__ . '/services/AuthService.php';
Flight::register('auth_service', 'AuthService');

require_once __DIR__ . '/services/UsersService.php';
Flight::register('usersService', 'UsersService');

require_once __DIR__ . '/services/AppointmentsService.php';
Flight::register('appointmentsService', 'AppointmentsService');

require_once __DIR__ . '/services/MaterialsService.php';
Flight::register('materialsService', 'MaterialsService');

require_once __DIR__ . '/services/MessagesService.php';
Flight::register('messagesService', 'MessagesService');

require_once __DIR__ . '/services/LiveSessionsService.php';
Flight::register('liveSessionsService', 'LiveSessionsService');

// ==== Register Middleware ====
Flight::register('auth_middleware', 'AuthMiddleware');

// ==== Global JWT + Authorization Middleware ====
Flight::route('/*', function() {
    if (
        strpos(Flight::request()->url, '/auth/login') === 0 ||
        strpos(Flight::request()->url, '/auth/register') === 0
    ) {
        return true;
    } else {
        try {
            $token = Flight::request()->getHeader("Authentication");
            if (Flight::auth_middleware()->verifyToken($token)) {
                return true;
            }
        } catch (\Exception $e) {
            Flight::halt(401, $e->getMessage());
        }
    }
});

// ==== Register Routes ====
require_once __DIR__ . '/routes/AuthRoutes.php';
require_once __DIR__ . '/routes/UsersRoutes.php';
require_once __DIR__ . '/routes/AppointmentRoutes.php';
require_once __DIR__ . '/routes/MaterialsRoutes.php';
require_once __DIR__ . '/routes/MessagesRoutes.php';
require_once __DIR__ . '/routes/LiveSessionsRoutes.php';

// ==== Start App ====
Flight::start();