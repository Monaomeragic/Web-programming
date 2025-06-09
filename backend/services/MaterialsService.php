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

    /**
     * GET /materials?subject_name=...
     * Returns all materials, optionally filtered by subject_name query parameter.
     */

    public function getAll() {
        $subject = Flight::request()->query['subject_name'] ?? null;
        $materials = $this->dao->getAll(['subject_name' => $subject]);
        if (!$materials || !is_array($materials)) $materials = [];
        Flight::json(['status' => 'success', 'data' => $materials]);
    }

    /**
     * POST /materials
     * Creates a new material entry, handling file uploads and JSON fallback.
     */
    public function create($subjectName = null) {
        // Get authenticated user ID
        $user = Flight::get('user');
        $professorId = is_object($user) && isset($user->id)
            ? $user->id
            : (is_array($user) ? ($user['id'] ?? null) : null);

        $title = $_POST['material_title'] ?? null;

        // Check for uploaded file
        $hasFile = !empty($_FILES['file']['tmp_name']) && $_FILES['file']['error'] === UPLOAD_ERR_OK;

        if (!$hasFile || empty($professorId) || empty($subjectName) || empty($title)) {
            Flight::json(['status' => 'error', 'message' => 'All material fields are required'], 400);
            return;
        }

        // Handle file upload (ensure uploads/ exists with proper permissions)
        $uploadDir = __DIR__ . '/../../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        // Directory must be created manually and be writable by PHP.

        $fileInfo = $_FILES['file'];
        $ext = pathinfo($fileInfo['name'], PATHINFO_EXTENSION);
        $filename = uniqid('mat_') . '.' . $ext;
        $destPath = $uploadDir . $filename;
        if (!move_uploaded_file($fileInfo['tmp_name'], $destPath)) {
            Flight::json(['status'=>'error','message'=>'Failed to save file'], 500);
            return;
        }

        // Build a public URL pointing to the uploads folder
        $protocol = isset($_SERVER['REQUEST_SCHEME']) ? $_SERVER['REQUEST_SCHEME'] : 'https';
        $host = $_SERVER['HTTP_HOST'];
        $fileUrl = $protocol . '://' . $host . '/uploads/' . $filename;

        // Insert DB record
        $success = $this->dao->createMaterial([
            'professor_id'   => $professorId,
            'subject_name'   => $subjectName,
            'material_title' => $title,
            'material_url'   => $fileUrl
        ]);

        if ($success) {
            // Retrieve last insert ID from the DAO's PDO connection
            $lastId = $this->dao->getConnection()->lastInsertId();
            Flight::json([
                'status' => 'success',
                'message' => 'Material created',
                'data' => [
                    'id' => $lastId,
                    'material_url' => $fileUrl
                ]
            ], 201);
        } else {
            Flight::json(['status'=>'error','message'=>'Creation failed'], 500);
        }
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

        // Fetch the material to get its file path
        $material = $this->dao->getById($id);
        if ($material && !empty($material['material_url'])) {
            // Convert the public URL to the server file path
            // Assuming: /MonaOmeragic/Web-programming/uploads/filename.ext
            $relativePath = str_replace('/MonaOmeragic/Web-programming', '', $material['material_url']);
            $filePath = __DIR__ . '/../..' . $relativePath;
            if (file_exists($filePath)) {
                unlink($filePath); // Delete file from server
            }
        }

        // Delete the record from DB
        return $this->dao->deleteMaterial($id);
    }

    public function getAllMaterialsDetailed() {
        return $this->dao->getAllMaterialsDetailed();
    }

    public function getBySubject($subject) {
        if (empty($subject)) {
            throw new Exception('Subject name is required.');
        }
        $result = $this->dao->getBySubject($subject);
        if (!$result || !is_array($result)) $result = [];
        Flight::json(['status' => 'success', 'data' => $result]);
    }
}
?>