<?php
header("Access-Control-Allow-Origin: *");
include(__DIR__ . '/../db_connect.php');
include('cors.php');

$result = $conn->query("SELECT * FROM users ORDER BY created_at DESC");
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}
echo json_encode($users);
