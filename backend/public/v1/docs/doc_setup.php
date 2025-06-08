<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

/**
 * @OA\Info(
 *     title="Appointment System API",
 *     description="API for Appointment system",
 *     version="1.0.0",
 *     @OA\Contact(
 *         email="mona.omeragic@stu.ibu.edu.ba",
 *         name="Mona Omeragic"
 *     )
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="ApiKey",
 *     type="apiKey",
 *     in="header",
 *     name="Authentication"
 * )
 *
 * @OA\Server(
 *     url="http://localhost/MonaOmeragic/Web-programming/backend",
 *     description="Local Development Server"
 * )
 * @OA\Server(
 *     url="https://whale-app-ecbrt.ondigitalocean.app/index.php",
 *     description="Production API server"
 * )
 */
