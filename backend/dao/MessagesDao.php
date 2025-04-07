<?php
require_once 'BaseDao.php';

class MessagesDao extends BaseDao {
    public function __construct() {
        parent::__construct("messages");
    }

    public function getMessagesBetween($from_user_id, $to_user_id) {
        $stmt = $this->connection->prepare("
            SELECT * FROM `messages`
            WHERE (`from_user_id` = :from AND `to_user_id` = :to)
               OR (`from_user_id` = :to AND `to_user_id` = :from)
            ORDER BY `created_at` ASC
        ");
        $stmt->bindParam(':from', $from_user_id);
        $stmt->bindParam(':to', $to_user_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function markAsRead($message_id) {
        $stmt = $this->connection->prepare("
            UPDATE `messages` 
            SET `reading` = 1 
            WHERE `id` = :id
        ");
        $stmt->bindParam(':id', $message_id);
        return $stmt->execute();
    }

    public function createMessage($data) {
        return $this->insert($data);
    }

    public function getUnreadMessagesForUser($user_id) {
        $stmt = $this->connection->prepare("
            SELECT * FROM `messages`
            WHERE `to_user_id` = :user_id AND `reading` = 0
            ORDER BY `created_at` DESC
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}