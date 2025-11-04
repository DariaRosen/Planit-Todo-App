<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once(__DIR__ . '/checkSession.php');
require_once(__DIR__ . '/../db_connect.php');

// ✅ Verify user session
if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "User not authenticated"]);
    exit;
}

$user_id = (int) $_SESSION['user']['id'];

// ✅ Decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['task_id']) || !isset($input['day_date'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing task_id or day_date"]);
    exit;
}

$task_id = (int)$input['task_id'];
$day_date = $input['day_date'];

try {
    $stmt = $conn->prepare("INSERT INTO day_tasks (task_id, user_id, day_date, status) VALUES (?, ?, ?, 'pending')");
    $stmt->bind_param("iis", $task_id, $user_id, $day_date);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Task inserted successfully",
        "task_id" => $task_id,
        "day_date" => $day_date
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
