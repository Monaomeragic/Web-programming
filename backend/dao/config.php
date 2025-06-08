<?php

// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL ^ (E_NOTICE | E_DEPRECATED));

class Config {
   public static function DB_NAME() {
       // Default: DigitalOcean database name
       return Config::get_env("DB_NAME", "defaultdb");
   }
   public static function DB_PORT() {
       // Default: DigitalOcean port
       return Config::get_env("DB_PORT", 25060);
   }
   public static function DB_USER() {
       // Default: DigitalOcean user
       return Config::get_env("DB_USER", 'doadmin');
   }
   public static function DB_PASSWORD() {
       // Default: DigitalOcean password (replace YOUR_ACTUAL_PASSWORD)
       return Config::get_env("DB_PASSWORD", '');
   }
   public static function DB_HOST() {
       // Default: DigitalOcean host
       return Config::get_env("DB_HOST", 'db-mysql-fra1-29004-do-user-23069002-0.e.db.ondigitalocean.com');
   }
   public static function JWT_SECRET() {
       // You can keep your existing secret or change it as you wish
       return Config::get_env("JWT_SECRET", ',mona_$FQBhJ');
   }
   public static function get_env($name, $default){
       return isset($_ENV[$name]) && trim($_ENV[$name]) != "" ? $_ENV[$name] : $default;
   }
}