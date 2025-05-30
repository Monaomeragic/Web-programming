<?php
require_once __DIR__ . '/../dao/AppointmentsDao.php';
require_once 'BaseService.php';

class AppointmentsService extends BaseService {

    public function __construct() {
        $dao = new AppointmentsDao();
        parent::__construct($dao);
    }

    // Special business logic

    public function getByProfessor($professor_id) {
        if (!$professor_id) {
            throw new Exception('Professor ID is required.');
        }
        return $this->dao->getByProfessor($professor_id);
    }

    public function getByProfessorId($professor_id) {
        return $this->getByProfessor($professor_id);
    }

    /**
     * Return all appointments for a single student
     *
     * @param int $student_id
     * @return array
     * @throws Exception
     */
    public function getByStudentId($student_id) {
        if (!$student_id) {
            throw new Exception('Student ID is required.');
        }
        // Delegate to DAO method that actually exists
        return $this->dao->getByStudentId($student_id);
    }

    public function createAppointment($data) {
        if (empty($data['student_id']) || empty($data['professor_id']) || empty($data['date'])) {
            throw new Exception('Student ID, Professor ID, and Date are required.');
        }
        return $this->dao->createAppointment($data);
    }

    public function cancelAppointmentByStudent($appointment_id, $student_id) {
        if (!$appointment_id || !$student_id) {
            throw new Exception('Appointment ID and Student ID are required.');
        }
        return $this->dao->cancelAppointmentByStudent($appointment_id, $student_id);
    }

    public function updateStatus($id, $status) {
        return $this->dao->updateStatus($id, $status);
    }

    public function updateAppointmentStatus($appointment_id, $status) {
        if (!$appointment_id || !$status) {
            throw new Exception('Appointment ID and status are required.');
        }

        //booking status za studente
        $allowedStatuses = ['pending', 'confirmed', 'canceled'];
        if (!in_array($status, $allowedStatuses)) {
            throw new Exception('Invalid status value.');
        }

        return $this->dao->updateAppointmentStatus($appointment_id, $status);
    }

    public function sendMessageAboutAppointment($appointment_id, $from_user_id, $to_user_id, $message) {
        if (empty($appointment_id) || empty($from_user_id) || empty($to_user_id) || empty($message)) {
            throw new Exception('All message details are required.');
        }
        return $this->dao->sendMessageAboutAppointment($appointment_id, $from_user_id, $to_user_id, $message);
    }

    public function getAllAppointments() {
        return $this->dao->getAllAppointments();
    }
}
?>