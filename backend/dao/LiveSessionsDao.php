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

    /**
     * Helper: Decode the JSON-encoded attendees list into a PHP array of integers.
     */
    private function decodeAttendees($jsonString) {
        $arr = json_decode($jsonString, true);
        return is_array($arr) ? array_map('intval', $arr) : [];
    }

    /**
     * Get the current list of attendee IDs for a session.
     */
    public function getAttendeesList($session_id) {
        $sql = "SELECT attendees FROM `live_sessions` WHERE id = :session_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':session_id', $session_id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $this->decodeAttendees($row['attendees'] ?? '[]');
    }

    /**
     * Update the attendees JSON column for a session.
     */
    public function updateAttendees($session_id, array $attendeeIds) {
        $json = json_encode(array_values($attendeeIds));
        $sql = "UPDATE `live_sessions` SET attendees = :json WHERE id = :session_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':json', $json);
        $stmt->bindParam(':session_id', $session_id);
        return $stmt->execute();
    }

    /**
     * Check if a student is already in the attendees array for a session.
     */
    public function isStudentAttending($session_id, $student_id) {
        $attList = $this->getAttendeesList($session_id);
        return in_array((int)$student_id, $attList, true);
    }

    /**
     * Count how many students are attending a session.
     */
    public function countAttendees($session_id) {
        return count($this->getAttendeesList($session_id));
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
}