<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include('cors.php');
include_once "../db_connect.php";

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
  echo json_encode(["success" => false, "error" => "Missing user_id"]);
  exit;
}

// Optionally, allow filtering by specific days (e.g., visible 3 days)
$days = $_GET['days'] ?? null;
$daysArray = $days ? explode(',', $days) : [];

if (!empty($daysArray)) {
  $placeholders = implode(',', array_fill(0, count($daysArray), '?'));
  $types = str_repeat('s', count($daysArray)) . 'i'; // 's' for day_date, 'i' for user_id
  $query = "SELECT dt.day_date, t.id AS task_id, t.title, t.frequency, dt.status
              FROM day_tasks dt
              JOIN tasks t ON t.id = dt.task_id
              WHERE dt.user_id = ? AND dt.day_date IN ($placeholders)
              ORDER BY dt.day_date";
  $stmt = $conn->prepare($query);

  // bind dynamic params
  $params = array_merge([$user_id], $daysArray);
  $ref = [];
  foreach ($params as $k => $v) $ref[$k] = &$params[$k];
  array_unshift($ref, $types);
  call_user_func_array([$stmt, 'bind_param'], $ref);

  $stmt->execute();
  $res = $stmt->get_result();
} else {
  $stmt = $conn->prepare("SELECT dt.day_date, t.id AS task_id, t.title, t.frequency, dt.status
                            FROM day_tasks dt
                            JOIN tasks t ON t.id = dt.task_id
                            WHERE dt.user_id = ?
                            ORDER BY dt.day_date");
  $stmt->bind_param("i", $user_id);
  $stmt->execute();
  $res = $stmt->get_result();
}

$tasksByDay = [];
while ($row = $res->fetch_assoc()) {
  $tasksByDay[$row['day_date']][] = $row;
}

echo json_encode(["success" => true, "tasks" => $tasksByDay]);
$stmt->close();
$conn->close();
