<?php
require_once __DIR__ . '/../dao/UsersDao.php';
require_once 'BaseService.php';

class UsersService extends BaseService {
    protected $usersDao;
    public function __construct() {
        $dao = new UsersDao();
        parent::__construct($dao);
        $this->usersDao = $dao;
    }

    public function registerUser($data) {
        if (empty($data['email']) || empty($data['password'])) {
            throw new Exception('Email and password are required.');
        }

        // ako mail postojiv
        $existingUser = $this->usersDao->getByEmail($data['email']);
        if ($existingUser) {
            throw new Exception('User with this email already exists.');
        }

        // user mora biti stu ili prof ili assistant
        if (!in_array($data['role'], ['professor', 'assistant', 'student'])) {
            throw new Exception('Role must be professor, assistant, or student.');
        }
        // Allow professor/assistant emails under any “@prof.” domain, and students under any “@stu.” domain
        if (in_array($data['role'], ['professor', 'assistant']) && !preg_match('/@prof\\./', $data['email'])) {
            throw new Exception('Professor or assistant email must contain “@prof.”');
        }
        if ($data['role'] === 'student' && !preg_match('/@stu\\./', $data['email'])) {
            throw new Exception('Student email must contain “@stu.”');
        }

        
        if (isset($data['subjects'])) {
            if (is_array($data['subjects']) && count($data['subjects']) > 0) {
                $data['subjects'] = $data['subjects'][0]; // store only the first selected subject
            } else if (is_array($data['subjects'])) {
                $data['subjects'] = null; // empty array fallback
            }
        }
        error_log("Final subjects value: " . json_encode($data['subjects']));

        // Safely map 'name' to 'username' if needed
        if (!isset($data['username']) && isset($data['name'])) {
            $data['username'] = $data['name'];
            unset($data['name']);
        }

        return $this->usersDao->createUser($data);
    }

    // Add a create method for direct user creation using registerUser logic
    public function create($data) {
        return $this->registerUser($data);
    }

    // service za login
    public function login(array $data): array {
        if (empty($data['email']) || empty($data['password'])) {
            throw new Exception('Email and password are required.');
        }

        return Flight::auth_service()->login($data);
    }

    public function getUser($id) {
        if (!$id) {
            throw new Exception('User ID is required.');
        }

        return $this->usersDao->getUserById($id);
    }

    public function updateUser($id, $data) {
        if (!$id || empty($data)) {
            throw new Exception('User ID and data are required.');
        }

        return $this->usersDao->updateUser($id, $data);
    }

  
    public function deleteUser($id) {
        if (!$id) {
            throw new Exception('User ID is required.');
        }

        return $this->usersDao->deleteUser($id);
    }


    public function changePassword($id, $newPassword) {
        if (!$id || empty($newPassword)) {
            throw new Exception('User ID and new password are required.');
        }

        return $this->usersDao->changePassword($id, $newPassword);
    }

    public function getProfessorsBySubject($subject) {
        if (empty($subject)) {
            throw new Exception('Subject is required.');
        }

        return $this->usersDao->getProfessorsBySubject($subject);
    }

    public function getUsersByRole($role) {
        if (empty($role)) {
            throw new Exception('Role is required.');
        }

        return $this->usersDao->getByRole($role);
    }

    public function getAllUsers() {
        return $this->usersDao->getAll();
    }
}
?>