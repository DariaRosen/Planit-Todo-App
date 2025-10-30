<?php
include '../config/db.php';

$result = $conn->query("
  SELECT dt.id, dt.task_id, dt.day_date, dt.status, t.title, t.frequency
  FROM day_tasks dt
  JOIN tasks t ON dt.task_id = t.id
  ORDER BY dt.day_date ASC
");

$tasks = [];
while ($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}

echo json_encode($tasks);
