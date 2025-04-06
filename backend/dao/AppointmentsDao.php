<?php
require_once 'BaseDao.php';
require_once 'MessagesDao.php';  //zbog messages koje su poseban dio al se nalaze kod appointmenta za profesore

class AppointmentsDao extends BaseDao {
    public function __construct() {
        parent::__construct("appointments");
    }

    public function getByProfessor($professor_id) {
        $stmt = $this->connection->prepare("SELECT * FROM `appointments` WHERE `professor_id` = :professor_id");
        $stmt->bindParam(':professor_id', $professor_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function createAppointment($data) {
        $sql = "INSERT INTO appointments (student_id, professor_id, date, status) VALUES (:student_id, :professor_id, :date, 'pending')";
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute($data);
    }

    public function cancelAppointmentByStudent($appointment_id, $student_id) {
        $sql = "UPDATE appointments SET status = 'canceled' WHERE id = :appointment_id AND student_id = :student_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':appointment_id', $appointment_id);
        $stmt->bindParam(':student_id', $student_id);
        return $stmt->execute();
    }

    public function updateAppointmentStatus($appointment_id, $status) {
        $sql = "UPDATE appointments SET status = :status WHERE id = :appointment_id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':appointment_id', $appointment_id);
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
}
?>