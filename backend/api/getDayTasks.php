<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include('cors.php');
include_once "../db_connect.php";

$user_id = $_GET['user_id'] ?? null;
$daysParam = $_GET['days'] ?? null;

if (!$user_id || !$daysParam) {
  echo json_encode(["success" => false, "error" => "Missing user_id or days"]);
  exit;
}

$days = explode(',', $daysParam);
$placeholders = implode(',', array_fill(0, count($days), '?'));
$types = str_repeat('s', count($days)); // all strings

$query = "
    SELECT 
        dt.id AS day_task_id,
        dt.task_id,
        dt.day_date,
        COALESCE(dt.title, t.title) AS title,
        COALESCE(t.frequency, 'custom') AS frequency,
        dt.status
    FROM day_tasks dt
    LEFT JOIN tasks t ON dt.task_id = t.id
    WHERE dt.user_id = ?
      AND dt.day_date IN ($placeholders)
    ORDER BY dt.day_date ASC
";

$stmt = $conn->prepare($query);
if (!$stmt) {
  echo json_encode(["success" => false, "error" => $conn->error]);
  exit;
}

$stmt->bind_param("i" . $types, $user_id, ...$days);
$stmt->execute();
$result = $stmt->get_result();

$grouped = [];
while ($row = $result->fetch_assoc()) {
  $day = $row['day_date'];
  if (!isset($grouped[$day])) $grouped[$day] = [];
  $grouped[$day][] = [
    "id" => (int)$row["day_task_id"],
    "task_id" => (int)$row["task_id"],
    "title" => $row["title"],
    "frequency" => $row["frequency"],
    "status" => $row["status"]
  ];
}

echo json_encode(["success" => true, "tasks" => $grouped]);
$stmt->close();
$conn->close();
