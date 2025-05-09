<?php

/**
 * @OA\Get(
 *     path="/appointments",
 *     summary="Get all appointments",
 *     tags={"Appointments"},
 *     @OA\Response(response="200", description="List of appointments")
 * )
 */
Flight::route('GET /appointments', function() {
    Flight::json(Flight::appointmentsService()->getAll());
});

/**
 * @OA\Get(
 *     path="/appointments/{id}",
 *     summary="Get an appointment by ID",
 *     tags={"Appointments"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Single appointment details")
 * )
 */
Flight::route('GET /appointments/@id', function($id) {
    Flight::json(Flight::appointmentsService()->getById($id));
});

/**
 * @OA\Post(
 *     path="/appointments",
 *     summary="Create a new appointment",
 *     tags={"Appointments"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent()
 *     ),
 *     @OA\Response(response="200", description="Appointment created")
 * )
 */
Flight::route('POST /appointments', function() {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::appointmentsService()->create($data));
});

/**
 * @OA\Put(
 *     path="/appointments/{id}",
 *     summary="Update an appointment by ID",
 *     tags={"Appointments"},
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
 *     @OA\Response(response="200", description="Appointment updated")
 * )
 */
Flight::route('PUT /appointments/@id', function($id) {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::appointmentsService()->update($id, $data));
});

/**
 * @OA\Delete(
 *     path="/appointments/{id}",
 *     summary="Delete an appointment by ID",
 *     tags={"Appointments"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Appointment deleted")
 * )
 */
Flight::route('DELETE /appointments/@id', function($id) {
    Flight::appointmentsService()->delete($id);
    Flight::json(["message" => "Appointment deleted successfully"]);
});