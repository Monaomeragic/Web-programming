<?php
// backend/middleware/AuthMiddleware.php

require_once __DIR__ . '/../dao/config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware {
    /**
     * Verify the JWT token from the request header.
     *
     * @param string|null $token
     * @return bool
     */
    public function verifyToken($token) {
        if (!$token) {
            Flight::halt(401, "Missing authentication header");
        }
        $decoded_token = JWT::decode($token, new Key(Config::JWT_SECRET(), 'HS256'));
        Flight::set('user', $decoded_token->user);
        Flight::set('jwt_token', $token);
        return true;
    }

    public function authorize() {
        $rawHeaders = function_exists('getallheaders') ? getallheaders() : [];
        $headers = array_change_key_case($rawHeaders, CASE_LOWER);
        // Capture Authorization header from various server vars
        if (empty($headers['authorization']) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers['authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (empty($headers['authorization']) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers['authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        $token = $headers['authorization'] ?? null;

        // Fallback: allow token via ?token= in query string
        if (empty($token) && isset($_GET['token'])) {
            $token = $_GET['token'];
        }

        if (!$token) {
            Flight::halt(401, 'Missing authentication header');
        }

        $token = str_replace('Bearer ', '', $token);
        $this->verifyToken($token);
    }

    /**
     * Authorize a single required role.
     *
     * @param string $requiredRole
     */
    public function authorizeRole($requiredRole) {
        $user = Flight::get('user');
        if ($user->role !== $requiredRole) {
            Flight::halt(403, 'Access denied');
        }
    }

    /**
     * Authorize against a set of allowed roles.
     *
     * @param array $roles
     */
    public function authorizeRoles(array $roles) {
        $user = Flight::get('user');
        if (!in_array($user->role, $roles)) {
            Flight::halt(403, 'Forbidden: role not allowed');
        }
    }

    /**
     * Authorize a specific permission.
     *
     * @param string $permission
     */
    public function authorizePermission($permission) {
        $user = Flight::get('user');
        if (empty($user->permissions) || !in_array($permission, $user->permissions)) {
            Flight::halt(403, 'Access denied');
        }
    }

    /**
     * Authorize either a specific role or the owner themselves.
     *
     * @param string $requiredRole
     * @param mixed $ownerId
     */
    public function checkRoleOrSelf($requiredRole, $ownerId) {
        $user = Flight::get('user');
        if ($user->role !== $requiredRole && $user->id != $ownerId) {
            Flight::halt(403, 'Forbidden: insufficient privileges');
        }
    }
}