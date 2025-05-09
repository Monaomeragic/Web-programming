<?php
require_once __DIR__ . '/../dao/MaterialsDao.php';
require_once 'BaseService.php';

class MaterialsService extends BaseService {

    public function __construct() {
        $dao = new MaterialsDao();
        parent::__construct($dao);
    }

    // Special business logic

    public function getMaterialsByProfessor($professor_id) {
        if (!$professor_id) {
            throw new Exception('Professor ID is required.');
        }
        return $this->dao->getMaterialsByProfessor($professor_id);
    }

    public function createMaterial($data) {
        if (empty($data['professor_id']) || empty($data['subject_name']) || empty($data['material_title']) || empty($data['material_url'])) {
            throw new Exception('All material fields are required.');
        }

        return $this->dao->createMaterial($data);
    }

    public function updateMaterial($id, $updateData) {
        if (!$id || empty($updateData)) {
            throw new Exception('Material ID and updated data are required.');
        }

        return $this->dao->updateMaterial($id, $updateData);
    }

    public function deleteMaterial($id) {
        if (!$id) {
            throw new Exception('Material ID is required.');
        }

        return $this->dao->deleteMaterial($id);
    }

    public function getAllMaterialsDetailed() {
        return $this->dao->getAllMaterialsDetailed();
    }

    public function getBySubject($subject) {
        if (empty($subject)) {
            throw new Exception('Subject name is required.');
        }
        return $this->dao->getBySubject($subject);
    }
}
?>