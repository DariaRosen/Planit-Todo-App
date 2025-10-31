<?php
header("Access-Control-Allow-Origin: *");
include '../config/db.php';

$result = $conn->query("SELECT * FROM users ORDER BY created_at DESC");
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}
echo json_encode($users);
