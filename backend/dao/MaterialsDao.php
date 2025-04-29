<?php
require_once 'BaseDao.php';

class MaterialsDao extends BaseDao {
    public function __construct() {
        parent::__construct("materials");
    }

    // Dohvata sve materijale određenog profesora
    public function getMaterialsByProfessor($professorId) {
        $sql = "SELECT * FROM materials WHERE professor_id = :professor_id ORDER BY created_at DESC";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':professor_id', $professorId);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function createMaterial($materialData) {
        $sql = "INSERT INTO materials (professor_id, subject_n, material_t, material_l) VALUES (:professor_id, :subject_n, :material_t, :material_l)";
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute($materialData);
    }

    // Updejtuje materijal
    public function updateMaterial($id, $updateData) {
        $sql = "UPDATE materials SET subject_name = :subject_name, material_title = :material_title, material_url = :material_url WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $updateData['id'] = $id;
        return $stmt->execute($updateData);
    }

    // Briše materijal
    public function deleteMaterial($id) {
        $sql = "DELETE FROM materials WHERE id = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    // Dohvata sve materijale sa korisničkim imenom profesora
    public function getAllMaterialsDetailed() {
        $sql = "SELECT m.id, m.subject_name, m.material_title, m.material_url, u.username AS professor_name FROM materials m JOIN users u ON m.professor_id = u.id ORDER BY m.created_at DESC";
        $stmt = $this->connection->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Dohvata sve materijale po profesoru
    public function getByProfessor($professor_id) {
        $sql = "SELECT * FROM `materials` WHERE `professor_id` = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':id', $professor_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Dohvata sve materijale po predmetu
    public function getBySubject($subject) {
        $sql = "SELECT * FROM `materials` WHERE `subject_name` = :subject";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':subject', $subject);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}