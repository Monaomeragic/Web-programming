<?php
require_once __DIR__ . '/../dao/MessagesDao.php';
require_once 'BaseService.php';

class MessagesService extends BaseService {

    public function __construct() {
        $dao = new MessagesDao();
        parent::__construct($dao);
    }

    // Special business logic

    public function getMessagesBetween($from_user_id, $to_user_id) {
        if (empty($from_user_id) || empty($to_user_id)) {
            throw new Exception('Both sender and receiver IDs are required.');
        }
        return $this->dao->getMessagesBetween($from_user_id, $to_user_id);
    }

    public function markMessageAsRead($message_id) {
        if (empty($message_id)) {
            throw new Exception('Message ID is required.');
        }
        return $this->dao->markAsRead($message_id);
    }

    public function createMessage($data) {
        if (empty($data['from_user_id']) || empty($data['to_user_id']) || empty($data['content'])) {
            throw new Exception('From User, To User, and Content are required to send a message.');
        }
        return $this->dao->createMessage($data);
    }

    public function getUnreadMessagesForUser($user_id) {
        if (empty($user_id)) {
            throw new Exception('User ID is required.');
        }
        return $this->dao->getUnreadMessagesForUser($user_id);
    }
}
?>