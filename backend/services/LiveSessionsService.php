<?php
require_once __DIR__ . '/../dao/LiveSessionsDao.php';
require_once 'BaseService.php';

class LiveSessionsService extends BaseService {

    public function __construct() {
        $dao = new LiveSessionsDao();
        parent::__construct($dao);
    }

    // Special business logic

    public function getSessionsByProfessor($professor_id) {
        if (empty($professor_id)) {
            throw new Exception('Professor ID is required.');
        }
        return $this->dao->getByProfessor($professor_id);
    }

    public function getUpcomingSessions() {
        return $this->dao->upcomingSessions();
    }

    public function createLiveSession($data) {
        if (empty($data['professor_id']) || empty($data['title']) || empty($data['scheduled_time']) || empty($data['max_students'])) {
            throw new Exception('All fields (professor_id, title, scheduled_time, max_students) are required.');
        }
        return $this->dao->createSession($data);
    }

    public function updateLiveSession($id, $data) {
        if (empty($id) || empty($data)) {
            throw new Exception('Session ID and data are required.');
        }
        return $this->dao->updateSession($id, $data);
    }

    public function deleteLiveSession($id) {
        if (empty($id)) {
            throw new Exception('Session ID is required.');
        }
        return $this->dao->deleteSession($id);
    }

    public function getAttendance($session_id) {
        if (empty($session_id)) {
            throw new Exception('Session ID is required.');
        }
        return $this->dao->getSessionAttendance($session_id);
    }

    // RSVP funkcija
    public function rsvpSession($session_id, $student_id) {
        if (empty($session_id) || empty($student_id)) {
            throw new Exception('Session ID and Student ID are required to RSVP.');
        }

        // check je li sutdent vec RSVP
        $existing = $this->dao->checkIfStudentRSVPed($session_id, $student_id);
        if ($existing) {
            throw new Exception('You have already RSVP’d to this session.');
        }

        return $this->dao->rsvpSession($session_id, $student_id);
    }
}
?>