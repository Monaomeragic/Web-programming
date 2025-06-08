<?php
require_once __DIR__ . '/dao/config.php';

class Database
{
    private static $instance = null;

    public static function getInstance()
    {
        if (self::$instance === null) {
            $dsn = 'mysql:host=' . Config::DB_HOST() . ';port=' . Config::DB_PORT() .
                ';dbname=' . Config::DB_NAME() . ';charset=utf8mb4';

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ];

            // Uncomment the following line and update the path if you use SSL for DigitalOcean
            // $options[PDO::MYSQL_ATTR_SSL_CA] = __DIR__ . '/ca-certificate.crt';

            try {
                self::$instance = new PDO($dsn, Config::DB_USER(), Config::DB_PASSWORD(), $options);
            } catch (PDOException $e) {
                die('Connection failed: ' . $e->getMessage());
            }
        }
        return self::$instance;
    }

    public static function connect() {
        return self::getInstance();
    }
}