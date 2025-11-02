<?php
// 🧩 Enable CORS (for your local React frontend)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

// 🧠 Include session and DB
require_once(__DIR__ . '/../checkSession.php');
require_once(__DIR__ . '/../db_connect.php');

// ✅ Make sure the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "User not authenticated"]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // 1️⃣ Get the latest day stored for this user
    $stmt = $conn->prepare("SELECT MAX(day_date) AS last_date FROM day_tasks WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $last_date = $row['last_date'] ?? null;
    $stmt->close();

    // 2️⃣ Count how many future days already exist
    $today = date('Y-m-d');
    $stmt = $conn->prepare("
        SELECT COUNT(DISTINCT day_date) AS future_count
        FROM day_tasks
        WHERE user_id = ? AND day_date >= ?
    ");
    $stmt->bind_param("is", $user_id, $today);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $existingFutureCount = $res['future_count'] ?? 0;
    $stmt->close();

    // 3️⃣ If user already has 7 upcoming days, stop
    if ($existingFutureCount >= 7) {
        echo json_encode([
            "success" => true,
            "message" => "User already has 7 upcoming days — nothing added",
            "days" => []
        ]);
        exit;
    }

    // 4️⃣ Generate missing days (up to 7 total)
    $daysToAdd = 7 - $existingFutureCount;
    $start_date = $last_date ? date('Y-m-d', strtotime("$last_date +1 day")) : $today;

    $days = [];
    for ($i = 0; $i < $daysToAdd; $i++) {
        $days[] = date('Y-m-d', strtotime("$start_date +$i day"));
    }

    // 5️⃣ Get all base tasks for this user
    $tasks = [];
    $stmt = $conn->prepare("SELECT * FROM tasks WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($t = $res->fetch_assoc()) $tasks[] = $t;
    $stmt->close();

    // 6️⃣ Prepare inserts
    $insertStmt = $conn->prepare("
        INSERT INTO day_tasks (task_id, day_date, status, user_id)
        VALUES (?, ?, 'pending', ?)
    ");

    foreach ($days as $day) {
        $weekday = date('l', strtotime($day));

        foreach ($tasks as $task) {
            $isDaily = $task['frequency'] === 'daily';
            $isWeeklyMonday = $task['frequency'] === 'weekly' && $weekday === 'Monday';

            if ($isDaily || $isWeeklyMonday) {
                // Check if already exists
                $checkStmt = $conn->prepare("
                    SELECT COUNT(*) AS cnt
                    FROM day_tasks
                    WHERE task_id = ? AND day_date = ? AND user_id = ?
                ");
                $checkStmt->bind_param("isi", $task['id'], $day, $user_id);
                $checkStmt->execute();
                $exists = $checkStmt->get_result()->fetch_assoc()['cnt'] ?? 0;
                $checkStmt->close();

                if ($exists == 0) {
                    $insertStmt->bind_param("isi", $task['id'], $day, $user_id);
                    $insertStmt->execute();
                }
            }
        }
    }

    $insertStmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Next 7 days generated successfully for user $user_id",
        "days" => $days
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
