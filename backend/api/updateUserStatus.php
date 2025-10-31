<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// ✅ safer include — resolves path even if script called from another directory
include(__DIR__ . '/../db_connect.php');

// ✅ check DB connection
if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// ✅ read & validate JSON
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE || !$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid or missing JSON body"]);
    exit;
}

$user_id = $data["user_id"] ?? null;
$is_logged_in = $data["is_logged_in"] ?? null;

if (!$user_id || $is_logged_in === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing user_id or is_logged_in"]);
    exit;
}

// ✅ execute SQL safely
$stmt = $conn->prepare("UPDATE users SET is_logged_in = ? WHERE id = ?");
$stmt->bind_param("ii", $is_logged_in, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
