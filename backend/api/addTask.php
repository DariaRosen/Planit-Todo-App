<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

include('cors.php'); 
include_once "../db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$title = $data["title"] ?? '';
$frequency = $data["frequency"] ?? 'as_needed';

if (!$title) {
    echo json_encode(["error" => "Title is required"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO tasks (title, frequency) VALUES (?, ?)");
$stmt->bind_param("ss", $title, $frequency);
$stmt->execute();

echo json_encode(["success" => true, "id" => $stmt->insert_id]);
$stmt->close();
$conn->close();
