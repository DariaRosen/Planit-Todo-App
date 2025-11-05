<?php
// -------------------------------------
// ✅ Handle CORS & preflight requests
// -------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// -------------------------------------
// ✅ Include your DB + CORS files
// -------------------------------------
include('cors.php');
include_once "../db_connect.php";

// -------------------------------------
// ✅ Parse input JSON
// -------------------------------------
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid JSON input"]);
    exit;
}

$task_id = $data['task_id'] ?? null;
$day_date = $data['day_date'] ?? null;

if (!$task_id || !$day_date) {
    echo json_encode(["success" => false, "error" => "Missing task_id or day_date"]);
    exit;
}

// -------------------------------------
// ✅ Insert into database
// -------------------------------------
$stmt = $conn->prepare("INSERT INTO day_tasks (task_id, day_date) VALUES (?, ?)");
$stmt->bind_param("is", $task_id, $day_date);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
