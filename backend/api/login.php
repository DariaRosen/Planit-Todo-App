<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173"); // ✅ NOT *
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Handle preflight requests (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include(__DIR__ . '/../db_connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['is_logged_in'] = true;

    // optional: update DB field
    $update = $conn->prepare("UPDATE users SET is_logged_in = 1 WHERE id = ?");
    $update->bind_param("i", $user['id']);
    $update->execute();

    echo json_encode(["success" => true, "user" => $user]);
} else {
    echo json_encode(["success" => false, "error" => "User not found"]);
}
