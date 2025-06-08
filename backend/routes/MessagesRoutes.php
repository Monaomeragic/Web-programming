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
    // Allow students, professors, and assistants
    Flight::auth_middleware()->authorizeRoles([
        Roles::STUDENT,
        Roles::PROFESSOR,
        Roles::ASSISTANT
    ]);
    $user = Flight::get('user');
    if ($user->role === Roles::STUDENT) {
        // Student: fetch inbox (messages they received)
        $msgs = Flight::messagesService()->getUnreadMessagesForUser($user->id);
    } else {
        // Professor/Assistant: fetch sent messages
        $msgs = Flight::messagesService()->getBySenderId($user->id);
    }
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
    if (!$msg || $msg['to_user_id'] != $user->id) {
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

    // Validate required fields
    if (!isset($data['from_user_id']) || !isset($data['to_user_id']) || !isset($data['content'])) {
        Flight::halt(400, json_encode([
            "error" => "from_user_id, to_user_id, and content are required"
        ]));
    }

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
    if (!$msg || $msg['to_user_id'] != $user->id) {
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
    if (!$msg || $msg['to_user_id'] != $user->id) {
        Flight::halt(403, "Access denied");
    }
    $deleted = Flight::messagesService()->delete($id);
    Flight::json(['deleted' => (bool)$deleted]);
});
