<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/AuthDao.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthService extends BaseService {
    private $auth_dao;

    public function __construct() {
        $this->auth_dao = new AuthDao();
        parent::__construct($this->auth_dao);
    }

    /**
     * Register a new user.
     *
     * @param array $data ['email' => string, 'password' => string]
     * @return array ['success' => bool, 'data' => array|null, 'error' => string|null]
     */
    public function register($data) {
        if (empty($data['email']) || empty($data['password'])) {
            return ['success' => false, 'error' => 'Email and password are required.'];
        }
        // Only students may self-register
        if (isset($data['role']) && $data['role'] !== 'student') {
            return ['success' => false, 'error' => 'Only students can self-register.'];
        }
        // Require a role and enforce email domain per role
        if (empty($data['role'])) {
            return ['success' => false, 'error' => 'Role is required (student, professor, assistant, or admin).'];
        }
        switch ($data['role']) {
            case 'student':
                if (substr($data['email'], -7) !== '@stu.ba') {
                    return ['success' => false, 'error' => 'Student email must end with @stu.ba'];
                }
                break;
            case 'professor':
            case 'assistant':
                if (substr($data['email'], -8) !== '@prof.ba') {
                    return ['success' => false, 'error' => ucfirst($data['role']) . ' email must end with @prof.ba'];
                }
                break;
            case 'admin':
                if ($data['email'] !== 'admin@admin.com' || $data['password'] !== 'admin123') {
                    return ['success' => false, 'error' => 'Invalid admin credentials.'];
                }
                break;
            default:
                return ['success' => false, 'error' => 'Invalid role specified.'];
        }
        if ($this->auth_dao->get_user_by_email($data['email'])) {
            return ['success' => false, 'error' => 'Email already registered.'];
        }
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        $created = $this->auth_dao->insert($data);
        if (!$created) {
            return ['success' => false, 'error' => 'Failed to register user.'];
        }
        $user = $this->auth_dao->get_user_by_email($data['email']);
        unset($user['password']);
        return ['success' => true, 'data' => $user];
    }

    /**
     * Log in an existing user and return a JWT.
     *
     * @param array $data ['email' => string, 'password' => string]
     * @return array ['success' => bool, 'data' => array|null, 'error' => string|null]
     */
    public function login($data) {
        if (empty($data['email']) || empty($data['password'])) {
            return ['success' => false, 'error' => 'Email and password are required.'];
        }
        $user = $this->auth_dao->get_user_by_email($data['email']);
        if (!$user || !password_verify($data['password'], $user['password'])) {
            return ['success' => false, 'error' => 'Invalid email or password.'];
        }
        unset($user['password']);
        $payload = [
            'user' => $user,
            'iat'  => time(),
            'exp'  => time() + (60 * 60 * 24)
        ];
        $token = JWT::encode($payload, Config::JWT_SECRET(), 'HS256');
        return ['success' => true, 'data' => array_merge($user, ['token' => $token])];
    }
}