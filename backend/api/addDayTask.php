<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

include('cors.php'); 
include __DIR__ . '/../db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

$task_id = $data['task_id'] ?? null;
$day_date = $data['day_date'] ?? null;

if (!$task_id || !$day_date) {
    echo json_encode(["error" => "Task ID and day date are required"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO day_tasks (task_id, day_date) VALUES (?, ?)");
$stmt->bind_param("is", $task_id, $day_date);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $stmt->insert_id]);
} else {
    echo json_encode(["error" => $stmt->error]);
}
