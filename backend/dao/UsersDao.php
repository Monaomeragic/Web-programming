<?php
require_once 'BaseDao.php';

class UsersDao extends BaseDao {
    public function __construct() {
        parent::__construct("users");
    }

    public function getByEmail($email) {
        $stmt = $this->connection->prepare("SELECT * FROM `users` WHERE `email` = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function getByRole($role) {
        $stmt = $this->connection->prepare("SELECT * FROM `users` WHERE `role` = :role");
        $stmt->bindParam(':role', $role);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getProfessorsBySubject($subject) {
        $stmt = $this->connection->prepare("SELECT * FROM `users` WHERE `role` = 'professor' AND `subject` = :subject");
        $stmt->bindParam(':subject', $subject);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function changePassword($id, $newPassword) {
        $stmt = $this->connection->prepare("
            UPDATE users SET password = :password WHERE id = :id
        ");
        $stmt->bindParam(":password", $newPassword);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    public function getUserById($id) {
        $stmt = $this->connection->prepare("SELECT id, username, email, role FROM users WHERE id = :id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function login($email) {
        $stmt = $this->connection->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function createUser($data) {
        return $this->insert($data);
    }

    public function readUser($id) {
        return $this->getById($id);
    }

    public function updateUser($id, $data) {
        return $this->update($id, $data);
    }

    public function deleteUser($id) {
        return $this->delete($id);
    }
}