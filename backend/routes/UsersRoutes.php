<?php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../data/roles.php';

/**
 * @OA\Get(
 *     path="/users",
 *     security={{"ApiKey":{}}},
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
Flight::route('GET /users', function () {
    // Authorize and verify JWT for all authenticated users
    Flight::auth_middleware()->authorize(); // Allow all authenticated users
    // Fetch the decoded token user info
    $user = Flight::get('user');
    // Now load all users
    $users = Flight::usersService()->getAll();
    Flight::json($users);
});

// New route: Get all professors and assistants (staff) - for students and admins
Flight::route('GET /users/staff', function () {
    // Authorize and verify JWT for all authenticated users
    Flight::auth_middleware()->authorize(); // Allow all authenticated users

    // Fetch and return professors + assistants
    $professors = Flight::usersService()->getUsersByRole('professor') ?? [];
    $assistants = Flight::usersService()->getUsersByRole('assistant') ?? [];
    $staff = array_merge($professors, $assistants);

    Flight::json($staff);
});

/**
 * @OA\Get(
 *     path="/users/{id}",
 *     security={{"ApiKey":{}}},
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
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    Flight::json(Flight::usersService()->getById($id));
});

/**
 * @OA\Post(
 *     path="/users",
 *     security={{"ApiKey":{}}},
 *     tags={"Users"},
 *     summary="Create a new user",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"name","role","email","password"},
 *             @OA\Property(property="name", type="string"),
 *             @OA\Property(property="role", type="string", example="professor", enum={"professor", "assistant", "student"}),
 *             @OA\Property(property="email", type="string"),
 *             @OA\Property(property="password", type="string"),
 *             @OA\Property(property="subjects", type="array", @OA\Items(type="string"))
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
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    $data = Flight::request()->data->getData(); // use JSON body (base64 upload)

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

    $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
    $id = Flight::usersService()->create($data);
    Flight::json([
        "success" => true,
        "id" => $id
    ]);
});

/**
 * @OA\Put(
 *     path="/users/{id}",
 *     security={{"ApiKey":{}}},
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
    Flight::auth_middleware()->checkRoleOrSelf(Roles::ADMIN, $id);
    $data = Flight::request()->data->getData();
    $user = Flight::usersService()->update($id, $data);
    Flight::json($user);
});

/**
 * @OA\Delete(
 *     path="/users/{id}",
 *     security={{"ApiKey":{}}},
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
    Flight::auth_middleware()->checkRoleOrSelf(Roles::ADMIN, $id);
    $success = Flight::usersService()->delete($id);
    Flight::json([
        "success" => $success,
        "message" => $success ? "User deleted" : "Delete failed"
    ]);
});
?>