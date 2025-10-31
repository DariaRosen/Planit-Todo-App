<?php
// ✅ Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("HTTP/1.1 200 OK");
    exit;
}

// ✅ Normal CORS headers for real requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include(__DIR__ . '/../db_connect.php');

// ✅ Parse JSON input safely
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data["user_id"]) || !isset($data["is_logged_in"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing user_id or is_logged_in"]);
    exit;
}

$user_id = (int)$data["user_id"];
$is_logged_in = (int)$data["is_logged_in"];

// ✅ Update DB safely
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
