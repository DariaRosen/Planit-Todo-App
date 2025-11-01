<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

include('cors.php');
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);
$task_id = $data["task_id"];
$daily_amount = $data["daily_amount"];

if (!$task_id) {
    echo json_encode(["error" => "Missing task_id"]);
    exit;
}

$stmt = $conn->prepare("UPDATE tasks SET daily_amount = ? WHERE id = ?");
$stmt->bind_param("ii", $daily_amount, $task_id);
$stmt->execute();

echo json_encode(["success" => true]);
