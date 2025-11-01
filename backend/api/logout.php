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

include('cors.php');
include(__DIR__ . '/../db_connect.php');

if (isset($_SESSION['user_id'])) {
  $user_id = $_SESSION['user_id'];
  $stmt = $conn->prepare("UPDATE users SET is_logged_in = 0 WHERE id = ?");
  $stmt->bind_param("i", $user_id);
  $stmt->execute();
}

$_SESSION = [];
session_destroy();

setcookie("PHPSESSID", "", time() - 3600, "/");

echo json_encode(["success" => true]);
?>
