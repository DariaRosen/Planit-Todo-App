<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
  header("HTTP/1.1 200 OK");
  exit;
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include '../db_connect.php';


// Read and decode JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE || !$data) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Invalid or missing JSON body"]);
  exit;
}


if (!$data || empty($data["name"])) {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Missing required field: name"]);
  exit;
}

$name = $data["name"];
$email = $data["email"] ?? null;
$is_main_user = isset($data["is_main_user"]) ? (int)$data["is_main_user"] : 0;
$avatar_url = $data["avatar_url"] ?? null;

// Prepare statement safely
$stmt = $conn->prepare("
    INSERT INTO users (name, email, is_main_user, avatar_url)
    VALUES (?, ?, ?, ?)
");

$stmt->bind_param("ssis", $name, $email, $is_main_user, $avatar_url);

if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "user_id" => $conn->insert_id,
    "message" => "User added successfully"
  ]);
} else {
  http_response_code(500);
  echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
