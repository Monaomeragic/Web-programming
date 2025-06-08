<?php

// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL ^ (E_NOTICE | E_DEPRECATED));

class Config {
    // Switch this to true for local dev, false for production
    private static $USE_LOCAL = true;

    public static function DB_NAME() {
        // Local: 'appointment', Production: 'defaultdb'
        return self::get_env("DB_NAME", self::$USE_LOCAL ? "appointment" : "defaultdb");
    }
    public static function DB_PORT() {
        // Local: 3306, Production: 25060 (or your production port)
        return self::get_env("DB_PORT", self::$USE_LOCAL ? 3306 : 25060);
    }
    public static function DB_USER() {
        // Local: 'root', Production: 'doadmin'
        return self::get_env("DB_USER", self::$USE_LOCAL ? "root" : "doadmin");
    }
    public static function DB_PASSWORD() {
        // Local: '', Production: (set as env variable, do not hard-code)
        return self::get_env("DB_PASSWORD", self::$USE_LOCAL ? "" : "");
    }
    public static function DB_HOST() {
        // Local: '127.0.0.1', Production: your DigitalOcean host
        return self::get_env("DB_HOST", self::$USE_LOCAL ? "127.0.0.1" : "db-mysql-fra1-29004-do-user-23069002-0.e.db.ondigitalocean.com");
    }
    public static function JWT_SECRET() {
        // Use a strong secret! Change for your app.
        return self::get_env("JWT_SECRET", ',mona_$FQBhJ');
    }
    public static function get_env($name, $default){
        return isset($_ENV[$name]) && trim($_ENV[$name]) != "" ? $_ENV[$name] : $default;
    }
}

/**
 * How to use:
 * - When working locally, leave $USE_LOCAL = true;
 * - When deploying to DigitalOcean, set $USE_LOCAL = false; and set real DB credentials via environment variables (never hard-code passwords).
 *
 * This makes switching between local and production easy and safe.
 */