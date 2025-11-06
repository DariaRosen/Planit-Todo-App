<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include('cors.php');
include_once "../db_connect.php";

$input = json_decode(file_get_contents("php://input"), true);
$user_id = $input['user_id'] ?? null;
$day_task_id = $input['day_task_id'] ?? null;
$status = $input['status'] ?? null;

if (!$user_id || !$day_task_id || !$status) {
    echo json_encode(["success" => false, "error" => "Missing parameters"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE day_tasks SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?");
    $stmt->bind_param("sii", $status, $day_task_id, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Status updated", "new_status" => $status]);
    } else {
        echo json_encode(["success" => false, "error" => "No matching record found"]);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
