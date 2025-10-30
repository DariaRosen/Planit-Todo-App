<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

include_once "../db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? 0;
$completed = isset($data["completed"]) ? (int)$data["completed"] : 0;
$title = $data["title"] ?? null;

if (!$id) {
    echo json_encode(["error" => "Task ID is required"]);
    exit;
}

if ($title !== null) {
    $stmt = $conn->prepare("UPDATE tasks SET title=? WHERE id=?");
    $stmt->bind_param("si", $title, $id);
} else {
    $stmt = $conn->prepare("UPDATE tasks SET completed=? WHERE id=?");
    $stmt->bind_param("ii", $completed, $id);
}

$stmt->execute();
echo json_encode(["success" => true]);
$stmt->close();
$conn->close();
