<?php
// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("HTTP/1.1 200 OK");
    exit;
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include('cors.php');
include(__DIR__ . '/../db_connect.php');

// Read JSON body
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE || !$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON body"]);
    exit;
}

$user_id = $data["user_id"] ?? null;
$is_logged_in = $data["is_logged_in"] ?? null;

if (!$user_id || $is_logged_in === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET is_logged_in = ? WHERE id = ?");
$stmt->bind_param("ii", $is_logged_in, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User status updated"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
