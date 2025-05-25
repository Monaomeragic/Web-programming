<?php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../data/roles.php';

/**
 * @OA\Get(
 *     path="/messages",
 *     summary="Get all messages",
 *     tags={"Messages"},
 *     security={{"ApiKey":{}}},
 *     @OA\Response(response="200", description="List of messages")
 * )
 */
Flight::route('GET /messages', function() {
    Flight::auth_middleware()->authorizeRole(Roles::STUDENT);
    $user = Flight::get('user');
    $msgs = Flight::messagesService()->getByReceiverId($user->id);
    Flight::json($msgs);
});

/**
 * @OA\Get(
 *     path="/messages/{id}",
 *     summary="Get a message by ID",
 *     tags={"Messages"},
 *     security={{"ApiKey":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Single message")
 * )
 */
Flight::route('GET /messages/@id', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::STUDENT);
    $user = Flight::get('user');
    $msg = Flight::messagesService()->getById($id);
    if (!$msg || $msg['receiver_id'] != $user->id) {
        Flight::halt(403, "Access denied");
    }
    Flight::json($msg);
});

/**
 * @OA\Post(
 *     path="/messages",
 *     summary="Create a new message",
 *     tags={"Messages"},
 *     security={{"ApiKey":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent()
 *     ),
 *     @OA\Response(response="200", description="Message created")
 * )
 */
Flight::route('POST /messages', function() {
    Flight::auth_middleware()->authorizeRoles([
        Roles::PROFESSOR,
        Roles::ASSISTANT
    ]);
    $data = Flight::request()->data->getData();
    // Expecting sender_id, receiver_id, content
    $message = Flight::messagesService()->create($data);
    Flight::json($message);
});

/**
 * @OA\Post(
 *     path="/messages/{id}/read",
 *     summary="Mark a message as read",
 *     tags={"Messages"},
 *     security={{"ApiKey":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Message deleted upon read")
 * )
 */
Flight::route('POST /messages/@id/read', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::STUDENT);
    $user = Flight::get('user');
    // Only allow marking own messages
    $msg = Flight::messagesService()->getById($id);
    if (!$msg || $msg['receiver_id'] != $user->id) {
        Flight::halt(403, "Access denied");
    }
    // Delete the message once read
    $deleted = Flight::messagesService()->delete($id);
    Flight::json(['deleted' => (bool)$deleted]);
});

/**
 * @OA\Delete(
 *     path="/messages/{id}",
 *     summary="Delete a message",
 *     tags={"Messages"},
 *     security={{"ApiKey":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Message deleted")
 * )
 */
Flight::route('DELETE /messages/@id', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::STUDENT);
    $user = Flight::get('user');
    $msg = Flight::messagesService()->getById($id);
    if (!$msg || $msg['receiver_id'] != $user->id) {
        Flight::halt(403, "Access denied");
    }
    $deleted = Flight::messagesService()->delete($id);
    Flight::json(['deleted' => (bool)$deleted]);
});
