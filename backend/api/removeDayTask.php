<?php
// -------------------------------------
// ✅ Handle CORS & preflight
// -------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Content-Type: application/json; charset=UTF-8");

include('cors.php');
include_once "../db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;
$day_task_id = $data['day_task_id'] ?? null;

if (!$user_id || !$day_task_id) {
    echo json_encode(["success" => false, "error" => "Missing user_id or day_task_id"]);
    exit;
}

try {
    // Debug log (optional)
    error_log("🗑 Deleting day_task_id=$day_task_id for user_id=$user_id", 0);

    $stmt = $conn->prepare("DELETE FROM day_tasks WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $day_task_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Task removed successfully",
            "affected_rows" => $stmt->affected_rows
        ]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
