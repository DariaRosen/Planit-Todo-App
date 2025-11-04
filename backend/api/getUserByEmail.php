<?php
// ---- Handle CORS & preflight ----
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("HTTP/1.1 200 OK");
    exit;
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// ---- Connect to DB ----
include(__DIR__ . '/../db_connect.php');
include('cors.php');

// ---- Validate email parameter ----
if (!isset($_GET['email'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing ?email= parameter"]);
    exit;
}

$email = trim($_GET['email']);
if ($email === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Empty email value"]);
    exit;
}

// ---- Prepare and execute query ----
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "user" => $user]);
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "User not found"]);
}

$stmt->close();
$conn->close();
