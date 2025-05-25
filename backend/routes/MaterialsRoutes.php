<?php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../data/roles.php';

// Load Materials Service
/**
 * @OA\Get(
 *     path="/materials",
 *     summary="Get all materials",
 *     tags={"Materials"},
 *     security={{"ApiKey":{}}},
 *     @OA\Response(response="200", description="List of materials")
 * )
 */
Flight::route('GET /materials', function() {
    Flight::auth_middleware()->authorizeRoles([
        Roles::PROFESSOR,
        Roles::ASSISTANT,
        Roles::STUDENT
    ]);
    Flight::json(Flight::materialsService()->getAll());
});

/**
 * @OA\Get(
 *     path="/materials/{id}",
 *     summary="Get material by ID",
 *     tags={"Materials"},
 *     security={{"ApiKey":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Single material")
 * )
 */
Flight::route('GET /materials/@id', function($id) {
    Flight::auth_middleware()->authorizeRoles([
        Roles::PROFESSOR,
        Roles::ASSISTANT,
        Roles::STUDENT
    ]);
    Flight::json(Flight::materialsService()->getById($id));
});

/**
 * @OA\Post(
 *     path="/materials",
 *     summary="Create a new material",
 *     tags={"Materials"},
 *     security={{"ApiKey":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent()
 *     ),
 *     @OA\Response(response="200", description="Material created")
 * )
 */
Flight::route('POST /materials', function() {
    Flight::auth_middleware()->authorizeRoles([
        Roles::PROFESSOR,
        Roles::ASSISTANT
    ]);
    $data = Flight::request()->data->getData();
    Flight::json(Flight::materialsService()->create($data));
});

/**
 * @OA\Put(
 *     path="/materials/{id}",
 *     summary="Update a material",
 *     tags={"Materials"},
 *     security={{"ApiKey":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent()
 *     ),
 *     @OA\Response(response="200", description="Material updated")
 * )
 */
Flight::route('PUT /materials/@id', function($id) {
    Flight::auth_middleware()->authorizeRoles([
        Roles::PROFESSOR,
        Roles::ASSISTANT
    ]);
    $data = Flight::request()->data->getData();
    Flight::json(Flight::materialsService()->update($id, $data));
});

/**
 * @OA\Delete(
 *     path="/materials/{id}",
 *     summary="Delete a material",
 *     tags={"Materials"},
 *     security={{"ApiKey":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Material deleted")
 * )
 */
Flight::route('DELETE /materials/@id', function($id) {
    Flight::auth_middleware()->authorizeRoles([
        Roles::PROFESSOR,
        Roles::ASSISTANT
    ]);
    Flight::materialsService()->delete($id);
    Flight::json(["message" => "Material deleted successfully"]);
});