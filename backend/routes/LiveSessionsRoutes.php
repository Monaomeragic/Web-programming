<?php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../data/roles.php';

// Load Live Sessions Service
/**
 * @OA\Get(
 *     path="/live_sessions",
 *     summary="Get all live sessions",
 *     tags={"Live Sessions"},
 *     security={{"ApiKey":{}}},
 *     @OA\Response(response="200", description="List of live sessions")
 * )
 */
Flight::route('GET /live_sessions', function() {
    $sessions = Flight::liveSessionsService()->get_all();
    Flight::json($sessions);
});

/**
 * @OA\Get(
 *     path="/live_sessions/{id}",
 *     summary="Get a live session by ID",
 *     tags={"Live Sessions"},
 *     security={{"ApiKey":{}}},
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
    $session = Flight::liveSessionsService()->get_by_id($id);
    Flight::json($session);
});

/**
 * @OA\Post(
 *     path="/live_sessions",
 *     summary="Create a new live session",
 *     tags={"Live Sessions"},
 *     security={{"ApiKey":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent()
 *     ),
 *     @OA\Response(response="200", description="Live session created")
 * )
 */
Flight::route('POST /live_sessions', function() {
    Flight::auth_middleware()->authorizeRole(Roles::PROFESSOR);
    $data = Flight::request()->data->getData();
    $new = Flight::liveSessionsService()->create($data);
    Flight::json($new);
});

/**
 * @OA\Put(
 *     path="/live_sessions/{id}",
 *     summary="Update a live session by ID",
 *     tags={"Live Sessions"},
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
 *     @OA\Response(response="200", description="Live session updated")
 * )
 */
Flight::route('PUT /live_sessions/@id', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::PROFESSOR);
    $data = Flight::request()->data->getData();
    $updated = Flight::liveSessionsService()->update($id, $data);
    Flight::json($updated);
});

/**
 * @OA\Delete(
 *     path="/live_sessions/{id}",
 *     summary="Delete a live session by ID",
 *     tags={"Live Sessions"},
 *     security={{"ApiKey":{}}},
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
    Flight::auth_middleware()->authorizeRole(Roles::PROFESSOR);
    Flight::liveSessionsService()->delete($id);
    Flight::json(["message" => "Live session deleted successfully"]);
});

// Students RSVP to a live session
Flight::route('POST /live_sessions/@id/attend', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::STUDENT);
    $user = Flight::get('user');
    $result = Flight::liveSessionsService()->attendSession($id, $user->id);
    Flight::json($result);
});

// Students cancel RSVP to a live session
Flight::route('DELETE /live_sessions/@id/attend', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::STUDENT);
    $user = Flight::get('user');
    $result = Flight::liveSessionsService()->cancelAttend($id, $user->id);
    Flight::json($result);
});

// Professors view list of attendees for a session
Flight::route('GET /live_sessions/@id/attendees', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::PROFESSOR);
    $user = Flight::get('user');
    // Ensure only the owning professor can view
    $session = Flight::liveSessionsService()->get_by_id($id);
    if ($session['professor_id'] != $user->id) {
        Flight::halt(403, json_encode(['error' => 'Forbidden']));
    }
    $attendees = Flight::liveSessionsService()->getAttendeeList($id);
    Flight::json($attendees);
});
