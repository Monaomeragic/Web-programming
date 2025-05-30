<?php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../data/roles.php';

/**
 * @OA\Get(
 *     path="/appointments",
 *     summary="Get all appointments",
 *     tags={"Appointments"},
 *     security={{"ApiKey":{}}},
 *     @OA\Response(response="200", description="List of appointments")
 * )
 */
Flight::route('GET /appointments', function() {
    Flight::auth_middleware()->authorize(); // ✅ Require token for any request
    $user = Flight::get('user');

    if (isset($_GET['professor_id'])) {
        try {
            $professorId = $_GET['professor_id'];
            $appointments = Flight::appointmentsService()->getByProfessorId($professorId);
            Flight::json($appointments);
            return;
        } catch (Exception $e) {
            error_log("❌ Error fetching appointments for professor_id $professorId: " . $e->getMessage());
            Flight::halt(500, "Server error: " . $e->getMessage());
        }
    }

    if ($user->role === Roles::ADMIN) {
        // Admin sees all appointments
        $appointments = Flight::appointmentsService()->getAllAppointments();
    } elseif ($user->role === Roles::STUDENT) {
        // Students see only their own bookings
        $appointments = Flight::appointmentsService()->getByStudentId($user->id);
    } elseif ($user->role === Roles::PROFESSOR || $user->role === Roles::ASSISTANT) {
        // Professors and assistants see bookings made to them
        $appointments = Flight::appointmentsService()->getByProfessorId($user->id);
    } else {
        Flight::halt(403, "Access denied");
    }
    Flight::json($appointments);
});

/**
 * @OA\Get(
 *     path="/appointments/{id}",
 *     summary="Get an appointment by ID",
 *     tags={"Appointments"},
 *     security={{"ApiKey":{}}},
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
    $user = Flight::get('user');
    $appointment = Flight::appointmentsService()->getById($id);
    if (!$appointment) {
        Flight::halt(404, "Appointment not found");
    }
    if ($user->role === Roles::STUDENT && $appointment['student_id'] != $user->id) {
        Flight::halt(403, "Access denied");
    }
    if (($user->role === Roles::PROFESSOR || $user->role === Roles::ASSISTANT)
        && $appointment['professor_id'] != $user->id) {
        Flight::halt(403, "Access denied");
    }
    Flight::json($appointment);
});

/**
 * @OA\Post(
 *     path="/appointments",
 *     summary="Create a new appointment",
 *     tags={"Appointments"},
 *     security={{"ApiKey":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent()
 *     ),
 *     @OA\Response(response="200", description="Appointment created")
 * )
 */
Flight::route('POST /appointments', function() {
    Flight::auth_middleware()->authorizeRole(Roles::STUDENT);
    $data = Flight::request()->data->getData();
    Flight::json(Flight::appointmentsService()->createAppointment($data));
});

/**
 * @OA\Put(
 *     path="/appointments/{id}",
 *     summary="Update an appointment by ID",
 *     tags={"Appointments"},
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
 *     @OA\Response(response="200", description="Appointment updated")
 * )
 */
Flight::route('PUT /appointments/@id', function($id) {
    // Only professors and assistants may confirm/cancel and send messages
    Flight::auth_middleware()->authorizeRoles([Roles::PROFESSOR, Roles::ASSISTANT]);

    // Get existing appointment to identify student
    $appointment = Flight::appointmentsService()->getById($id);
    if (!$appointment) {
        Flight::halt(404, "Appointment not found");
    }
    $studentId = $appointment['student_id'];

    // Read new status and optional message
    $data = Flight::request()->data->getData();
    $status  = $data['status']  ?? null;
    $message = $data['message'] ?? null;

    // Update appointment status
    $updatedAppointment = Flight::appointmentsService()->updateStatus($id, $status);

    // Send message from professor to student if provided
    $sentMessage = null;
    if ($message) {
        $sentMessage = Flight::messagesService()->create([
            'sender_id'   => Flight::get('user')->id,
            'receiver_id' => $studentId,
            'content'     => $message
        ]);
    }

    // Return both updated appointment and optional message
    Flight::json([
        'appointment' => $updatedAppointment,
        'message'     => $sentMessage
    ]);
});

/**
 * @OA\Delete(
 *     path="/appointments/{id}",
 *     summary="Delete an appointment by ID",
 *     tags={"Appointments"},
 *     security={{"ApiKey":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Appointment deleted")
 * )
 */
/**
 * DELETE /appointments/{id}
 *    Students  : may cancel their own bookings
 *    Professors: may cancel bookings made to them
 *    Assistants: same as professors
 */
Flight::route('DELETE /appointments/@id', function($id) {
    $user = Flight::get('user');

    // 1. Fetch appointment
    $appt = Flight::appointmentsService()->getById($id);
    if (!$appt) {
        Flight::halt(404, "Appointment not found");
    }

    // 2. Authorise according to role
    $allowed =
        ($user->role === Roles::STUDENT   && $appt['student_id']   == $user->id) ||
        ($user->role === Roles::PROFESSOR && $appt['professor_id'] == $user->id) ||
        ($user->role === Roles::ASSISTANT && $appt['professor_id'] == $user->id);

    if (!$allowed) {
        Flight::halt(403, "Access denied");
    }

    // 3. Delete (or change to a soft‑delete if you prefer)
    Flight::appointmentsService()->delete($id);
    Flight::json(["message" => "Appointment deleted successfully"]);
});

/**
 * @OA\Patch(
 *     path="/appointments/confirm/{id}",
 *     summary="Confirm an appointment",
 *     tags={"Appointments"},
 *     security={{"ApiKey":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response="200", description="Appointment confirmed")
 * )
 */
Flight::route('PATCH /appointments/confirm/@id', function($id) {
    Flight::auth_middleware()->authorizeRoles([Roles::PROFESSOR, Roles::ASSISTANT]);

    $appointment = Flight::appointmentsService()->getById($id);
    if (!$appointment) {
        Flight::halt(404, "Appointment not found");
    }

    if (Flight::get('user')->id != $appointment['professor_id']) {
        Flight::halt(403, "Access denied");
    }

    $updated = Flight::appointmentsService()->updateStatus($id, 'confirmed');
    Flight::json(['message' => 'Appointment confirmed successfully', 'appointment' => $updated]);
});

/**
 * @OA\Get(
 *     path="/appointments/detailed",
 *     summary="Get all appointments with student and professor details (admin)",
 *     tags={"Appointments"},
 *     security={{"ApiKey":{}}},
 *     @OA\Response(response="200", description="Detailed appointments for admin")
 * )
 */
Flight::route('GET /appointments/detailed', function() {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN); // Only admin can use this

    $db = Flight::db();
    $stmt = $db->prepare(
        "SELECT 
            a.id,
            a.date,
            a.status,
            a.time,
            s.username AS student_name,
            s.email AS student_email,
            p.username AS professor_name,
            p.email AS professor_email
        FROM appointments a
        LEFT JOIN users s ON a.student_id = s.id
        LEFT JOIN users p ON a.professor_id = p.id
        ORDER BY a.date DESC"
    );
    $stmt->execute();
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    Flight::json($appointments);
});