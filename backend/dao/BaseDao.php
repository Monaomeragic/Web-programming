<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/../Database.php';

class BaseDao {
    protected string $table_name;
    protected PDO $connection;

    public function __construct(string $table_name) {
        $this->table_name = $table_name;
        $this->connection = Database::getInstance();
    }

    /**
     * Get all records from the table.
     *
     * @return array An array of records.
     */
    public function getAll(): array {
        $stmt = $this->connection->prepare("SELECT * FROM `" . $this->table_name . "`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get PDO connection instance.
     *
     * @return PDO
     */
    public function getConnection(): PDO {
        return $this->connection;
    }

    /**
     * Get a record by its ID.
     *
     * @param mixed $id
     * @return array|false The record as an associative array or false if not found.
     */
    public function getById($id): array|false {
        $stmt = $this->connection->prepare("SELECT * FROM `" . $this->table_name . "` WHERE `id` = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Insert a new record.
     *
     * @param array $data Key-value pairs of columns and values.
     * @return bool True on success, false on failure.
     */
    public function insert(array $data): bool {
        $columns = implode(", ", array_map(fn($key) => "`$key`", array_keys($data)));
        $placeholders = ":" . implode(", :", array_keys($data));
        $sql = "INSERT INTO `" . $this->table_name . "` ($columns) VALUES ($placeholders)";
        $stmt = $this->connection->prepare($sql);
        return $stmt->execute($data);
    }

    /**
     * Update a record by ID.
     *
     * @param mixed $id
     * @param array $data Key-value pairs of columns and values to update.
     * @return bool True on success, false on failure.
     */
    public function update($id, array $data): bool {
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

    /**
     * Delete a record by ID.
     *
     * @param mixed $id
     * @return bool True on success, false on failure.
     */
    public function delete($id): bool {
        $stmt = $this->connection->prepare("DELETE FROM `" . $this->table_name . "` WHERE `id` = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Execute a query and return a single record.
     *
     * @param string $sql
     * @param array $params
     * @return array|false The record as an associative array or false if none found.
     */
    public function query_unique(string $sql, array $params = []): array|false {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
