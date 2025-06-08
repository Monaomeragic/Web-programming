<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL ^ (E_NOTICE | E_DEPRECATED));

class Config
{
    public static function DB_NAME()
    {
        return self::get_env("DB_NAME", 'appointment');
    }

    public static function DB_PORT()
    {
        return self::get_env("DB_PORT", 3306);
    }

    public static function DB_USER()
    {
        return self::get_env("DB_USER", 'root'); // Use env variable for production!
    }

    public static function DB_PASSWORD()
    {
        return self::get_env("DB_PASSWORD", '');
    }

    public static function DB_HOST()
    {
        return self::get_env("DB_HOST", '127.0.0.1');
    }

    public static function JWT_SECRET()
    {
        return self::get_env("JWT_SECRET", ',mona_$FQBhJ');
    }

    private static function get_env($name, $default)
    {
        if (isset($_ENV[$name]) && trim($_ENV[$name]) !== "") {
            return trim($_ENV[$name]);
        } elseif (isset($_SERVER[$name]) && trim($_SERVER[$name]) !== "") {
            return trim($_SERVER[$name]);
        } else {
            return trim($default);
        }
    }
}
?>
