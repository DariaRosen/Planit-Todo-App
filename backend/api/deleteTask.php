<?php
include_once "../db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? 0;

if (!$id) {
    echo json_encode(["error" => "Task ID is required"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM tasks WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

echo json_encode(["success" => true]);
$stmt->close();
$conn->close();
?>
