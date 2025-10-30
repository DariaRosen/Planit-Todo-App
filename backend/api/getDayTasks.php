<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

include __DIR__ . '/../db_connect.php';

// Handle OPTIONS preflight request (important for CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$sql = "
  SELECT dt.id, dt.task_id, dt.day_date, dt.status, t.title, t.frequency
  FROM day_tasks dt
  JOIN tasks t ON dt.task_id = t.id
  ORDER BY dt.day_date ASC
";

$result = $conn->query($sql);

if (!$result) {
  http_response_code(500);
  echo json_encode(["error" => $conn->error]);
  exit;
}

$tasks = [];
while ($row = $result->fetch_assoc()) {
  $tasks[] = $row;
}

echo json_encode($tasks);
