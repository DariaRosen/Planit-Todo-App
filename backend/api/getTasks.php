<?php
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
?>
