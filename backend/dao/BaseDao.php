<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/../Database.php';


class BaseDao {
   protected $table_name;
   protected $connection;


   public function __construct($table_name) {
       $this->table_name = $table_name;
       $this->connection = Database::getInstance();
   }
   public function getAll() {
    $stmt = $this->connection->prepare("SELECT * FROM `" . $this->table_name . "`");
    $stmt->execute();
    return $stmt->fetchAll();
}

public function getConnection() {
    return $this->connection;
}


public function getById($id) {
    $stmt = $this->connection->prepare("SELECT * FROM `" . $this->table_name . "` WHERE `id` = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    return $stmt->fetch();
}


public function insert($data) {
    $columns = implode(", ", array_map(fn($key) => "`$key`", array_keys($data)));
    $placeholders = ":" . implode(", :", array_keys($data));
    $sql = "INSERT INTO `" . $this->table_name . "` ($columns) VALUES ($placeholders)";
    $stmt = $this->connection->prepare($sql);
    return $stmt->execute($data);
}


public function update($id, $data) {
    $fields = "";
    foreach ($data as $key => $value) {
        $fields .= "`$key` = :$key, ";
    }
    $fields = rtrim($fields, ", ");
    $sql = "UPDATE `" . $this->table_name . "` SET $fields WHERE `id` = :id";
    $stmt = $this->connection->prepare($sql);
    $data['id'] = $id;
    return $stmt->execute($data);
}


public function delete($id) {
    $stmt = $this->connection->prepare("DELETE FROM `" . $this->table_name . "` WHERE `id` = :id");
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
}

/**
 * Execute a query and return a single record.
 *
 * @param string $sql
 * @param array $params
 * @return array|false
 */
public function query_unique(string $sql, array $params = []) {
    $stmt = $this->connection->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch();
}
}
?>
