<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

include('cors.php');
include __DIR__ . '/../db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$status = $data['status'] ?? null;

if (!$id || !$status) {
    echo json_encode(["error" => "ID and status are required"]);
    exit;
}

$stmt = $conn->prepare("UPDATE day_tasks SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => $stmt->error]);
}
