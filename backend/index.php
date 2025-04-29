<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/vendor/autoload.php';

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

//ucitavanje svih ruta
require_once __DIR__ . '/routes/UsersRoutes.php';
require_once __DIR__ . '/routes/AppointmentRoutes.php';
require_once __DIR__ . '/routes/MaterialsRoutes.php';
require_once __DIR__ . '/routes/MessagesRoutes.php';
require_once __DIR__ . '/routes/LiveSessionsRoutes.php';

Flight::start();
?>