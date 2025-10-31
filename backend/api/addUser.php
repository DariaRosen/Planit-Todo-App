<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

include '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"];
$email = $data["email"];
$password = password_hash($data["password"], PASSWORD_DEFAULT);
$is_main_user = $data["is_main_user"] ?? 0;
$avatar_url = $data["avatar_url"] ?? null;

$stmt = $conn->prepare("
  INSERT INTO users (name, email, password, is_main_user, avatar_url)
  VALUES (?, ?, ?, ?, ?)
");
$stmt->bind_param("sssds", $name, $email, $password, $is_main_user, $avatar_url);
$stmt->execute();

echo json_encode(["success" => true, "user_id" => $conn->insert_id]);
