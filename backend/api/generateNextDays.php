<?php
// Allow requests from your frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once('../config.php'); // include DB connection

header("Content-Type: application/json");

// Get POST body
$data = json_decode(file_get_contents("php://input"), true);

// Assume you send the user_id (optional)
$user_id = $data['user_id'] ?? null;

// 1️⃣ Fetch latest day_date from day_tasks table
$stmt = $pdo->query("SELECT MAX(day_date) AS last_date FROM day_tasks");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$last_date = $row['last_date'] ?? null;

// 2️⃣ Determine start date (today if empty, otherwise +1 day)
$start_date = $last_date ? date('Y-m-d', strtotime("$last_date +1 day")) : date('Y-m-d');

// 3️⃣ Generate next 7 days
$days = [];
for ($i = 0; $i < 7; $i++) {
    $days[] = date('Y-m-d', strtotime("$start_date +$i day"));
}

// 4️⃣ Get all tasks
$stmt = $pdo->query("SELECT * FROM tasks");
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 5️⃣ Prepare insert
$insertStmt = $pdo->prepare("
    INSERT INTO day_tasks (task_id, day_date, status)
    VALUES (:task_id, :day_date, 'pending')
");

// 6️⃣ Loop through days and tasks
foreach ($days as $day) {
    $weekday = date('l', strtotime($day)); // Monday, Tuesday, etc.

    foreach ($tasks as $task) {
        $isDaily = $task['frequency'] === 'daily';
        $isWeeklyMonday = $task['frequency'] === 'weekly' && $weekday === 'Monday';

        if ($isDaily || $isWeeklyMonday) {
            // Check if already exists
            $checkStmt = $pdo->prepare("
                SELECT COUNT(*) FROM day_tasks
                WHERE task_id = :task_id AND day_date = :day_date
            ");
            $checkStmt->execute([
                ':task_id' => $task['id'],
                ':day_date' => $day
            ]);
            $exists = $checkStmt->fetchColumn();

            if (!$exists) {
                $insertStmt->execute([
                    ':task_id' => $task['id'],
                    ':day_date' => $day
                ]);
            }
        }
    }
}

echo json_encode(["success" => true, "message" => "Next 7 days generated successfully", "days" => $days]);
