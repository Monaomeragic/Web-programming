<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../dao/config.php'; 
require_once __DIR__ . '/../services/UsersService.php';
require_once __DIR__ . '/../services/AppointmentsService.php';
require_once __DIR__ . '/../services/MaterialsService.php';
require_once __DIR__ . '/../services/MessagesService.php';
require_once __DIR__ . '/../services/LiveSessionsService.php';

echo "<pre>";

// Create service objects
$usersService = new UsersService();
$appointmentsService = new AppointmentsService();
$materialsService = new MaterialsService();
$messagesService = new MessagesService();
$livesessionsService = new LiveSessionsService();

// ------ USERS SERVICE TESTS ------
echo "****** Users Service Test ******\n";
$users = $usersService->getAll();
if (empty($users)) {
    echo "No users found. Inserting a test user...\n";
    $newUser = [
        "username" => "Test Student",
        "email" => "teststudent@stu.ba",
        "password" => password_hash("password123", PASSWORD_DEFAULT),
        "role" => "student"
    ];
    try {
        $createdUser = $usersService->create($newUser);
        echo "Test user created!\n";
        print_r($createdUser);
    } catch (Exception $e) {
        echo "Error creating test user: " . $e->getMessage() . "\n";
    }

    // za test profesora
    $professors = array_filter($usersService->getAll(), function($user) {
        return $user['role'] === 'professor';
    });

    if (empty($professors)) {
        echo "No professors found. Inserting a test professor...\n";
        $newProfessor = [
            "username" => "Test Professor",
            "email" => "testprofessor@ibu.ba",
            "password" => password_hash("professor123", PASSWORD_DEFAULT),
            "role" => "professor"
        ];
        try {
            $usersService->create($newProfessor);
            echo "Test professor created!\n";
            // After creating, fetch professors again
            $professors = array_filter($usersService->getAll(), function($user) {
                return $user['role'] === 'professor';
            });
            $professor = array_values($professors)[0];
            $professorId = $professor['id'];
        } catch (Exception $e) {
            echo "Error creating test professor: " . $e->getMessage() . "\n";
        }
    } else {
        $professor = array_values($professors)[0];
        $professorId = $professor['id'];
    }
} else {
    // If users exist, naci prof ID
    $professors = array_filter($users, function($user) {
        return $user['role'] === 'professor';
    });
    if (empty($professors)) {
        // ako nije nadjen prof da se novi doda
        echo "No professors found. Inserting a test professor...\n";
        $newProfessor = [
            "username" => "Test Professor",
            "email" => "testprofessor@ibu.ba",
            "password" => password_hash("professor123", PASSWORD_DEFAULT),
            "role" => "professor"
        ];
        try {
            $usersService->create($newProfessor);
            echo "Test professor created!\n";
            // After creating, fetch professors again
            $professors = array_filter($usersService->getAll(), function($user) {
                return $user['role'] === 'professor';
            });
            $professor = array_values($professors)[0];
            $professorId = $professor['id'];
        } catch (Exception $e) {
            echo "Error creating test professor: " . $e->getMessage() . "\n";
        }
    } else {
        $professor = array_values($professors)[0];
        $professorId = $professor['id'];
    }
}
print_r($users);

// ------ APPOINTMENTS SERVICE TESTS ------
echo "\n****** Appointments Service Tests ******\n";
$appointments = $appointmentsService->getAll();
if (empty($appointments)) {
    echo "No appointments found. Inserting a test appointment...\n";
    $newAppointment = [
        "student_id" => 18, // koji je id napravio
        "professor_id" => $professorId, // dynamic prof ID
        "date" => date('Y-m-d H:i:s'),
        "status" => "pending"
    ];
    try {
        $createdAppointment = $appointmentsService->create($newAppointment);
        echo "Test appointment created!\n";
        print_r($createdAppointment);
    } catch (Exception $e) {
        echo "Error creating appointment: " . $e->getMessage() . "\n";
    }
}
print_r($appointments);

// ------ MATERIALS SERVICE TESTS ------
echo "\n****** Materials Service Tests ******\n";
$materials = $materialsService->getAll();
if (empty($materials)) {
    echo "No materials found. Inserting a test material...\n";
    $newMaterial = [
        "professor_id" => $professorId,
        "subject_name" => "Mathematics",
        "material_title" => "Lecture 1",
        "material_url" => "uploads/lecture1.pdf"
    ];
    try {
        $createdMaterial = $materialsService->create($newMaterial);
        echo "Test material created!\n";
        print_r($createdMaterial);
    } catch (Exception $e) {
        echo "Error creating material: " . $e->getMessage() . "\n";
    }
}
print_r($materials);

// ------ MESSAGES SERVICE TESTS ------
echo "\n****** Messages Service Tests ******\n";
$messages = $messagesService->getAll();
if (empty($messages)) {
    echo "No messages found. Inserting a test message...\n";
    $newMessage = [
        "from_user_id" => $professorId, 
        "to_user_id" => 18, 
        "content" => "Welcome to the course!",
        "reading" => 0
    ];
    try {
        $createdMessage = $messagesService->create($newMessage);
        echo "Test message created!\n";
        print_r($createdMessage);
    } catch (Exception $e) {
        echo "Error creating message: " . $e->getMessage() . "\n";
    }
}
print_r($messages);

// ------ LIVE SESSIONS SERVICE TESTS ------
echo "\n****** Live Sessions Service Tests ******\n";
$livesessions = $livesessionsService->getAll();
if (empty($livesessions)) {
    echo "No live sessions found. Inserting a test session...\n";
    $newSession = [
        "professor_id" => $professorId, 
        "title" => "First Live Session",
        "description" => "Introduction session",
        "scheduled_time" => date('Y-m-d H:i:s', strtotime('+1 day')),
        "max_students" => 30
    ];
    try {
        $createdSession = $livesessionsService->create($newSession);
        echo "Test live session created!\n";
        print_r($createdSession);
    } catch (Exception $e) {
        echo "Error creating live session: " . $e->getMessage() . "\n";
    }
}
print_r($livesessions);

echo "\n\n ALL SERVICES TESTED! \n";
echo "</pre>";
?>