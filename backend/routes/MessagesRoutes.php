<?php

/**
 * @OA\Get(
 *     path="/messages",
 *     summary="Get all messages",
 *     tags={"Messages"},
 *     @OA\Response(response="200", description="List of messages")
 * )
 */
Flight::route('GET /messages', function() {
    Flight::json(Flight::messagesService()->getAll());
});

/**
 * @OA\Get(
 *     path="/messages/{id}",
 *     summary="Get a message by ID",
 *     tags={"Messages"},
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
    Flight::json(Flight::messagesService()->getById($id));
});

/**
 * @OA\Post(
 *     path="/messages",
 *     summary="Create a new message",
 *     tags={"Messages"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent()
 *     ),
 *     @OA\Response(response="200", description="Message created")
 * )
 */
Flight::route('POST /messages', function() {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::messagesService()->create($data));
});

/**
 * @OA\Put(
 *     path="/messages/{id}",
 *     summary="Update a message by ID",
 *     tags={"Messages"},
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
 *     @OA\Response(response="200", description="Message updated")
 * )
 */
Flight::route('PUT /messages/@id', function($id) {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::messagesService()->update($id, $data));
});

/**
 * @OA\Delete(
 *     path="/messages/{id}",
 *     summary="Delete a message by ID",
 *     tags={"Messages"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Message deleted")
 * )
 */
Flight::route('DELETE /messages/@id', function($id) {
    Flight::messagesService()->delete($id);
    Flight::json(["message" => "Message deleted successfully"]);
});
