<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include('cors.php');
include_once "../db_connect.php";
date_default_timezone_set('Asia/Jerusalem');

$input = json_decode(file_get_contents("php://input"), true);
$user_id = $input['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "error" => "Missing user_id"]);
    exit;
}

// ----------------------
// 1️⃣ Get all DAILY tasks (from global tasks table)
// ----------------------
$dailyTasksQuery = "SELECT id FROM tasks WHERE frequency = 'daily'";
$result = $conn->query($dailyTasksQuery);
$dailyTaskIds = [];
while ($row = $result->fetch_assoc()) {
    $dailyTaskIds[] = (int)$row['id'];
}

if (empty($dailyTaskIds)) {
    echo json_encode(["success" => true, "message" => "No daily tasks found"]);
    exit;
}

// ----------------------
// 2️⃣ Define 3 visible days: today + next 2 days
// ----------------------
$days = [];
for ($i = 0; $i < 3; $i++) {
    $d = new DateTime('now', new DateTimeZone('Asia/Jerusalem'));
    $d->modify("+$i day");
    $days[] = $d->format('Y-m-d');
}
$daysSql = "'" . implode("','", $days) . "'";

// ----------------------
// 3️⃣ Fetch existing day_tasks for this user in those 3 days
// ----------------------
$existing = [];
$existingQuery = $conn->prepare("SELECT task_id, day_date FROM day_tasks WHERE user_id = ? AND day_date IN ($daysSql)");
$existingQuery->bind_param("i", $user_id);
$existingQuery->execute();
$res = $existingQuery->get_result();
while ($row = $res->fetch_assoc()) {
    $existing[$row['day_date']][] = (int)$row['task_id'];
}
$existingQuery->close();

// ----------------------
// 4️⃣ Insert missing DAILY tasks
// ----------------------
$insertCount = 0;
foreach ($days as $day) {
    foreach ($dailyTaskIds as $taskId) {
        if (!isset($existing[$day]) || !in_array($taskId, $existing[$day])) {
            $stmt = $conn->prepare("INSERT INTO day_tasks (task_id, user_id, day_date, status) VALUES (?, ?, ?, 'pending')");
            if ($stmt) {
                $stmt->bind_param("iis", $taskId, $user_id, $day);
                if ($stmt->execute()) $insertCount++;
                $stmt->close();
            }
        }
    }
}

// ----------------------
// 5️⃣ Remove from day_tasks any task that is no longer DAILY
// ----------------------
$nonDailyQuery = "SELECT id FROM tasks WHERE frequency != 'daily'";
$nonDailyRes = $conn->query($nonDailyQuery);
$nonDailyIds = [];
while ($row = $nonDailyRes->fetch_assoc()) {
    $nonDailyIds[] = (int)$row['id'];
}
if (!empty($nonDailyIds)) {
    $nonDailySql = implode(",", $nonDailyIds);
    $conn->query("
        DELETE FROM day_tasks
        WHERE user_id = $user_id
          AND task_id IN ($nonDailySql)
          AND day_date IN ($daysSql)
    ");
}

echo json_encode([
    "success" => true,
    "inserted" => $insertCount,
    "days_checked" => $days,
    "message" => "✅ Daily tasks synced successfully"
]);
$conn->close();
