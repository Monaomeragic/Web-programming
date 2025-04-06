<?php
require_once 'config.php';
require_once 'UsersDao.php';
require_once 'MaterialsDao.php';
require_once 'AppointmentsDao.php';
require_once 'MessagesDao.php';
require_once 'LiveSessionsDao.php';

echo "<pre>";

$userDao = new UsersDao();
$materialsDao = new MaterialsDao();
$appointmentsDao = new AppointmentsDao();
$messagesDao = new MessagesDao();
$liveSessionsDao = new LiveSessionsDao();

// dodavanje studenta
$student = $userDao->getByEmail("student@test.com");
if (!$student) {
    $userDao->insert([
        "username" => "Test Student",
        "email" => "student@test.com",
        "password" => password_hash("123456", PASSWORD_DEFAULT),
        "role" => "student"
    ]);
    $student = $userDao->getByEmail("student@test.com");
} else {
    echo "Student already exists. Skipping insert.\n";
}

// dodavanje profesora
$professor = $userDao->getByEmail("prof@test.com");
if (!$professor) {
    $userDao->insert([
        "username" => "Test Professor",
        "email" => "prof@test.com",
        "password" => password_hash("123456", PASSWORD_DEFAULT),
        "role" => "professor"
    ]);
    $professor = $userDao->getByEmail("prof@test.com");
} else {
    echo "Professor already exists. Skipping insert.\n";
}

echo "\n************* Student:\n";
print_r($student);
echo "\n************* Professor:\n";
print_r($professor);

// dodavanje materijala
echo "\n************* Adding Material...\n";
$materialsDao->insert([
    "professor_id" => $professor["id"],
    "subject_name" => "Mathematics",
    "material_title" => "matematics.pdf",
    "material_url" => "http://matemathics.pdf"
]);
print_r($materialsDao->getAll());

// pravljenje appointmentaa
echo "\n************* Creating Appointment...\n";
$appointmentsDao->insert([
    "student_id" => $student["id"],
    "professor_id" => $professor["id"],
    "date" => "2025-04-07 15:24:52",
    "status" => "pending"
]);
print_r($appointmentsDao->getAll());

// Send message
echo "\n************* Sending Message...\n";
$messagesDao->insert([
    "from_user_id" => $professor["id"],
    "to_user_id" => $student["id"],
    "content" => "Don’t forget your appointment!",
    "reading" => 0,
    "created_at" => date("Y-m-d H:i:s")
]);
print_r($messagesDao->getAll());

// live session
echo "\n************* Creating Live Session...\n";
$liveSessionsDao->insert([
    "professor_id" => $professor["id"],
    "title" => "DAO Q&A",
    "description" => "Web nesto predavanje",
    "scheduled_time" => "2025-04-08 15:24:52",
    "max_students" => 10,
    "created_at" => date("Y-m-d H:i:s")
]);
print_r($liveSessionsDao->getAll());

// update materijal
echo "\n************* Updating Material\n";
$materials = $materialsDao->getAll();
if (!empty($materials)) {
    $material_id = $materials[0]['id'];
    $materialsDao->update($material_id, [
        "professor_id" => $professor["id"],
        "subject_name" => $materials[0]["subject_name"],
        "material_title" => "Updated Material Title",
        "material_url" => "https://updated-link.com/material.pdf"
    ]);
    echo "✅ Material updated!\n";
    print_r($materialsDao->getById($material_id));
}

// Update live session
echo "\n************* Updating Live Session\n";
$sessions = $liveSessionsDao->getAll();
if (!empty($sessions)) {
    $session_id = $sessions[0]['id'];
    $liveSessionsDao->update($session_id, [
        "professor_id" => $professor["id"],
        "title" => "Updated Session Title",
        "description" => "novo predavanje ",
        "scheduled_time" => $sessions[0]["scheduled_time"],
        "max_students" => $sessions[0]["max_students"],
        "created_at" => $sessions[0]["created_at"]
    ]);
    echo "✅ Live session updated!\n";
    print_r($liveSessionsDao->getById($session_id));
}

// promjena pasvorda za studenta  
echo "\n************* Changing Student Password \n";
$newStudentPassword = password_hash("newstudentpassword", PASSWORD_DEFAULT);
$userDao->changePassword($student["id"], $newStudentPassword);
echo "Password changed for student ID: {$student["id"]}\n";

// promjena pasvorda za profesora
echo "\n************* Changing Professor Password \n";
$newProfessorPassword = password_hash("newprofessorpassword", PASSWORD_DEFAULT);
$userDao->changePassword($professor["id"], $newProfessorPassword);
echo "Password changed for professor ID: {$professor["id"]}\n";

// Mark messages as read
echo "\n************* Marking Message as Read\n";
$messages = $messagesDao->getAll();
if (!empty($messages)) {
    $message_id = $messages[0]['id'];
    $messagesDao->update($message_id, [
        "from_user_id" => $messages[0]["from_user_id"],
        "to_user_id" => $messages[0]["to_user_id"],
        "content" => $messages[0]["content"],
        "reading" => 1,
        "created_at" => $messages[0]["created_at"]
    ]);
    echo "✅ Message marked as read!\n";
    print_r($messagesDao->getById($message_id));
}

echo "\n************* Deleting All\n";

// izbrisati materijale
$allMaterials = $materialsDao->getAll();
foreach ($allMaterials as $material) {
    $materialsDao->delete($material['id']);
    echo "Deleted Material ID: {$material['id']}\n";
}

// izbrisati appointment
$allAppointments = $appointmentsDao->getAll();
foreach ($allAppointments as $appointment) {
    $appointmentsDao->delete($appointment['id']);
    echo "Deleted Appointment ID: {$appointment['id']}\n";
}

// izbrisati poruke
$allMessages = $messagesDao->getAll();
foreach ($allMessages as $message) {
    $messagesDao->delete($message['id']);
    echo "Deleted Message ID: {$message['id']}\n";
}

// Dbrisanje live sessions
$allSessions = $liveSessionsDao->getAll();
foreach ($allSessions as $session) {
    $liveSessionsDao->delete($session['id']);
    echo "Deleted Live Session ID: {$session['id']}\n";
}

// brisanje usera
$userDao->delete($student["id"]);
$userDao->delete($professor["id"]);
echo "Deleted Student ID: {$student['id']}\n";
echo "Deleted Professor ID: {$professor['id']}\n";

echo "\n✅ All test entities successfully deleted.\n";

// finalni ispis
echo "\n************* Final Users:\n";
print_r($userDao->getAll());

echo "\n************* Final Materials:\n";
print_r($materialsDao->getAll());

echo "\n************* Final Appointments:\n";
print_r($appointmentsDao->getAll());

echo "\n************* Final Messages:\n";
print_r($messagesDao->getAll());

echo "\n************* Final Live Sessions:\n";
print_r($liveSessionsDao->getAll());



echo "\n ALL DONE! \n";
echo "</pre>";
?> 