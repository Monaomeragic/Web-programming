<?php

// Load Live Sessions Service
/**
 * @OA\Get(
 *     path="/live_sessions",
 *     summary="Get all live sessions",
 *     tags={"Live Sessions"},
 *     @OA\Response(response="200", description="List of live sessions")
 * )
 */
Flight::route('GET /live_sessions', function() {
    Flight::json(Flight::liveSessionsService()->getAll());
});

/**
 * @OA\Get(
 *     path="/live_sessions/{id}",
 *     summary="Get a live session by ID",
 *     tags={"Live Sessions"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Single live session details")
 * )
 */
Flight::route('GET /live_sessions/@id', function($id) {
    Flight::json(Flight::liveSessionsService()->getById($id));
});

/**
 * @OA\Post(
 *     path="/live_sessions",
 *     summary="Create a new live session",
 *     tags={"Live Sessions"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent()
 *     ),
 *     @OA\Response(response="200", description="Live session created")
 * )
 */
Flight::route('POST /live_sessions', function() {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::liveSessionsService()->create($data));
});

/**
 * @OA\Put(
 *     path="/live_sessions/{id}",
 *     summary="Update a live session by ID",
 *     tags={"Live Sessions"},
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
 *     @OA\Response(response="200", description="Live session updated")
 * )
 */
Flight::route('PUT /live_sessions/@id', function($id) {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::liveSessionsService()->update($id, $data));
});

/**
 * @OA\Delete(
 *     path="/live_sessions/{id}",
 *     summary="Delete a live session by ID",
 *     tags={"Live Sessions"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Live session deleted")
 * )
 */
Flight::route('DELETE /live_sessions/@id', function($id) {
    Flight::liveSessionsService()->delete($id);
    Flight::json(["message" => "Live session deleted successfully"]);
});
