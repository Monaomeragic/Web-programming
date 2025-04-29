<?php
require_once 'BaseDao.php';

class LiveSessionsDao extends BaseDao {
    public function __construct() {
        parent::__construct("live_sessions");
    }

    // live session od professora
    public function getByProfessor($professor_id) {
        $sql = "SELECT * FROM `live_sessions` WHERE `professor_id` = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':id', $professor_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Fetch all upcoming live sessions
    public function upcomingSessions() {
        $sql = "SELECT * FROM `live_sessions` WHERE `scheduled_time` > NOW()";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // nova live session
    public function createSession($data) {
        $sql = "INSERT INTO `live_sessions` (professor_id, title, description, scheduled_time, max_students, created_at) VALUES (:professor_id, :title, :description, :scheduled_time, :max_students, NOW())";
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute($data);
    }


    public function updateSession($id, $data) {
        $sql = "UPDATE `live_sessions` SET title = :title, description = :description, scheduled_time = :scheduled_time, max_students = :max_students WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':scheduled_time', $data['scheduled_time']);
        $stmt->bindParam(':max_students', $data['max_students']);
        return $stmt->execute();
    }

    // izbrisati live session
    public function deleteSession($id) {
        $sql = "DELETE FROM `live_sessions` WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    // atteandance koji profesor moze da vidi 
    public function getSessionAttendance($session_id) {
        $sql = "SELECT ls.id, ls.title, u.username, u.id as user_id FROM `live_sessions` ls JOIN `session_attendance` sa ON ls.id = sa.session_id JOIN `users` u ON sa.user_id = u.id WHERE ls.id = :session_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':session_id', $session_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    public function rsvpSession($session_id, $student_id) {
        $stmt = $this->connection->prepare("INSERT INTO session_attendance (session_id, student_id) VALUES (?, ?)");
        $stmt->execute([$session_id, $student_id]);
    }
    
    public function checkIfStudentRSVPed($session_id, $student_id) {
        $stmt = $this->connection->prepare("SELECT * FROM session_attendance WHERE session_id = ? AND student_id = ?");
        $stmt->execute([$session_id, $student_id]);
        return $stmt->fetch();
    }
}