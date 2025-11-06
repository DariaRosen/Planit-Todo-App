<?php
// 🪵 Enable full PHP error visibility (for local debugging)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// -------------------------------------
// ✅ Handle CORS & preflight requests
// -------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// -------------------------------------
// ✅ Include DB connection
// -------------------------------------
include('cors.php');
include_once "../db_connect.php";

// 🪵 Start debug array
$debug = [];

// -------------------------------------
// ✅ Parse input JSON
// -------------------------------------
$json = file_get_contents("php://input");
$debug['raw_input'] = $json;

$data = json_decode($json, true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "error" => "Invalid JSON input",
        "debug" => $debug
    ]);
    exit;
}

$user_id = $data['user_id'] ?? null;
$task_id = $data['task_id'] ?? null;
$day_date = $data['day_date'] ?? null;
$title = $data['title'] ?? null;

$debug['parsed_data'] = $data;

if (!$user_id || !$task_id || !$day_date) {
    echo json_encode([
        "success" => false,
        "error" => "Missing required parameters",
        "debug" => $debug
    ]);
    exit;
}

// -------------------------------------
// ✅ Check database connection
// -------------------------------------
if (!$conn) {
    echo json_encode([
        "success" => false,
        "error" => "No DB connection",
        "debug" => $debug
    ]);
    exit;
}

$debug['db_status'] = 'connected';

// -------------------------------------
// ✅ Attempt insertion
// -------------------------------------
try {
    $stmt = $conn->prepare("INSERT INTO day_tasks (user_id, task_id, day_date, title) VALUES (?, ?, ?, ?)");
    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "error" => "Prepare failed: " . $conn->error,
            "debug" => $debug
        ]);
        exit;
    }

    $debug['query'] = "INSERT INTO day_tasks (user_id, task_id, day_date, title) VALUES ($user_id, $task_id, '$day_date', '$title')";

    $stmt->bind_param("iiss", $user_id, $task_id, $day_date, $title);
    $executed = $stmt->execute();

    if ($executed) {
        echo json_encode([
            "success" => true,
            "id" => $stmt->insert_id,
            "debug" => $debug
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => $stmt->error,
            "debug" => $debug
        ]);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Exception: " . $e->getMessage(),
        "debug" => $debug
    ]);
}
exit;
