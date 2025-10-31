<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

include(__DIR__ . '/../db_connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data["user_id"];
$is_logged_in = $data["is_logged_in"];

$stmt = $conn->prepare("UPDATE users SET is_logged_in = ? WHERE id = ?");
$stmt->bind_param("ii", $is_logged_in, $user_id);
$stmt->execute();

echo json_encode(["success" => true]);
