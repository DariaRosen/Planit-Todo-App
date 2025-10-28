<?php
include_once "../db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$title = $data["title"] ?? '';

if (!$title) {
    echo json_encode(["error" => "Title is required"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO tasks (title) VALUES (?)");
$stmt->bind_param("s", $title);
$stmt->execute();

echo json_encode(["success" => true, "id" => $stmt->insert_id]);
$stmt->close();
$conn->close();
?>
