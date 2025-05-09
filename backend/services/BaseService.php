<?php
require_once __DIR__ . '/../dao/BaseDao.php';

class BaseService {
    protected $dao;

    public function __construct($dao) {
        $this->dao = $dao;
    }

    public function getAll() {
        try {
            return $this->dao->getAll();
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception("Error getting all entries.");
        }
    }

    public function getById($id) {
        try {
            return $this->dao->getById($id);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception("Error getting entry by ID.");
        }
    }

    public function create($data) {
        try {
            return $this->dao->insert($data);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception("Error creating new entry.");
        }
    }

    public function update($id, $data) {
        try {
            return $this->dao->update($id, $data);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception("Error updating entry.");
        }
    }

    public function delete($id) {
        try {
            return $this->dao->delete($id);
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw new Exception("Error deleting entry.");
        }
    }
}
?> 

