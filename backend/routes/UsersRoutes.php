<?php
/**
 * @OA\Get(
 *     path="/users",
 *     tags={"Users"},
 *     summary="Get all users",
 *     @OA\Response(
 *         response=200,
 *         description="List of users",
 *         @OA\JsonContent(type="array", @OA\Items(
 *             @OA\Property(property="id", type="integer"),
 *             @OA\Property(property="username", type="string"),
 *             @OA\Property(property="role", type="string"),
 *             @OA\Property(property="email", type="string")
 *         ))
 *     )
 * )
 */
Flight::route('GET /users', function(){
    Flight::json(Flight::usersService()->getAll());
});

/**
 * @OA\Get(
 *     path="/users/{id}",
 *     tags={"Users"},
 *     summary="Get user by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the user",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Single user data",
 *         @OA\JsonContent(
 *             @OA\Property(property="id", type="integer"),
 *             @OA\Property(property="username", type="string"),
 *             @OA\Property(property="role", type="string"),
 *             @OA\Property(property="email", type="string")
 *         )
 *     )
 * )
 */
Flight::route('GET /users/@id', function($id){
    Flight::json(Flight::usersService()->getById($id));
});

/**
 * @OA\Post(
 *     path="/users",
 *     tags={"Users"},
 *     summary="Create a new user",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"username","role","email","password"},
 *             @OA\Property(property="username", type="string"),
 *             @OA\Property(property="role", type="string", example="professor,assistant,student", enum={"professor", "assistant", "student"}),
 *             @OA\Property(property="email", type="string"),
 *             @OA\Property(property="password", type="string")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User created",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean"),
 *             @OA\Property(property="id", type="integer")
 *         )
 *     )
 * )
 */
Flight::route('POST /users', function(){
    $data = Flight::request()->data->getData();

    // student, professor ili assistant
    if (!in_array($data['role'], ['professor', 'assistant', 'student'])) {
        Flight::halt(400, json_encode(['error' => 'Role must be professor, assistant, or student']));
    }

    // mail validacija za stu, prof i assistant
    if (in_array($data['role'], ['professor', 'assistant']) && !str_ends_with($data['email'], '@prof.ba')) {
        Flight::halt(400, json_encode(['error' => 'Professor or assistant email must end with @prof.ba']));
    }

    if ($data['role'] === 'student' && !str_ends_with($data['email'], '@stu.ba')) {
        Flight::halt(400, json_encode(['error' => 'Student email must end with @stu.ba']));
    }

    // Admin 
    if ($data['role'] === 'admin' && ($data['email'] !== 'admin@admin.com' || $data['password'] !== 'admin123')) {
        Flight::halt(400, json_encode(['error' => 'Admin credentials are restricted to admin@admin.com / admin123']));
    }

    Flight::json(Flight::usersService()->create($data));
});

/**
 * @OA\Put(
 *     path="/users/{id}",
 *     tags={"Users"},
 *     summary="Update a user",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the user to update",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="username", type="string"),
 *             @OA\Property(property="role", type="string"),
 *             @OA\Property(property="email", type="string"),
 *             @OA\Property(property="password", type="string")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User updated",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean")
 *         )
 *     )
 * )
 */
Flight::route('PUT /users/@id', function($id){
    $data = Flight::request()->data->getData();
    Flight::json(Flight::usersService()->update($id, $data));
});

/**
 * @OA\Delete(
 *     path="/users/{id}",
 *     tags={"Users"},
 *     summary="Delete a user",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the user to delete",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User deleted",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean"),
 *             @OA\Property(property="message", type="string")
 *         )
 *     )
 * )
 */
Flight::route('DELETE /users/@id', function($id){
    Flight::json(["message" => "User deleted", "success" => Flight::usersService()->delete($id)]);
});
?>