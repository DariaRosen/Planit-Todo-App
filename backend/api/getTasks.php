<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

include('cors.php');
include_once "../db_connect.php";

$sql = "SELECT * FROM tasks ORDER BY id DESC";
$result = $conn->query($sql);

$tasks = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
}

echo json_encode($tasks);
