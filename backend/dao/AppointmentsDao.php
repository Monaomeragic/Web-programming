<?php
require_once 'BaseDao.php';
require_once 'MessagesDao.php';  //zbog messages koje su poseban dio al se nalaze kod appointmenta za profesore

class AppointmentsDao extends BaseDao {
    public function __construct() {
        parent::__construct("appointments");
    }

    public function getByProfessor($professor_id) {
        $stmt = $this->connection->prepare("SELECT * FROM `appointments` WHERE `professor_id` = :professor_id AND `status` != 'canceled'");
        $stmt->bindParam(':professor_id', $professor_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Fetch all appointments for a given student.
     *
     * @param int $student_id
     * @return array
     */
    public function getByStudentId($student_id) {
        $stmt = $this->connection->prepare("SELECT * FROM `appointments` WHERE `student_id` = :student_id");
        $stmt->bindParam(':student_id', $student_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function createAppointment($data) {
        $sql = "INSERT INTO appointments (student_id, professor_id, date, status) VALUES (:student_id, :professor_id, :date, 'pending')";
        $stmt = $this->connection->prepare($sql);
        $result = $stmt->execute($data);
        if (!$result) {
            error_log("Failed to insert appointment: " . json_encode($stmt->errorInfo()) . " | Data: " . json_encode($data));
        }
        return $result;
    }

    public function cancelAppointmentByStudent($appointment_id, $student_id) {
        $sql = "UPDATE appointments SET status = 'canceled' WHERE id = :appointment_id AND student_id = :student_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':appointment_id', $appointment_id);
        $stmt->bindParam(':student_id', $student_id);
        return $stmt->execute();
    }

    public function updateAppointmentStatus($appointment_id, $status) {
        // Fetch the original date
        $fetch = $this->connection->prepare("SELECT date FROM appointments WHERE id = :appointment_id");
        $fetch->bindParam(':appointment_id', $appointment_id);
        $fetch->execute();
        $original = $fetch->fetch();
        $original_date = $original['date'];

        // Now update status and confirmed_at, but preserve date
        $sql = "UPDATE appointments SET status = :status, confirmed_at = NOW(), date = :original_date WHERE id = :appointment_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':appointment_id', $appointment_id);
        $stmt->bindParam(':original_date', $original_date);
        return $stmt->execute();
    }

    public function sendMessageAboutAppointment($appointment_id, $from_user_id, $to_user_id, $message) {
        $messagesDao = new MessagesDao();
        return $messagesDao->createMessage([
            'from_user_id' => $from_user_id,
            'to_user_id' => $to_user_id,
            'content' => $message,
            'appointment_id' => $appointment_id
        ]);
    }
    public function updateStatus($id, $status) {
        return $this->updateAppointmentStatus($id, $status);
    }
}
?>