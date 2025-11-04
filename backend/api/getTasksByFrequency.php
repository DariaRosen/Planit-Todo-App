<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include('cors.php');
include_once "../db_connect.php";

// ---- Parse frequencies ----
// Expecting something like: ?frequencies=weekly,as_needed
if (!isset($_GET['frequencies'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing ?frequencies parameter"]);
    exit;
}

$freqParam = trim($_GET['frequencies']);
$frequencies = array_filter(array_map('trim', explode(',', $freqParam)));

if (empty($frequencies)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No valid frequencies provided"]);
    exit;
}

// ---- Build dynamic SQL with placeholders ----
$placeholders = implode(',', array_fill(0, count($frequencies), '?'));
$sql = "SELECT * FROM tasks WHERE frequency IN ($placeholders) ORDER BY id DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to prepare statement"]);
    exit;
}

$types = str_repeat('s', count($frequencies)); // all string params
$stmt->bind_param($types, ...$frequencies);
$stmt->execute();

$result = $stmt->get_result();
$tasks = [];

while ($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}

echo json_encode(["success" => true, "tasks" => $tasks]);

$stmt->close();
$conn->close();
