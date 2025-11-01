<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

if (isset($_SESSION['is_logged_in']) && $_SESSION['is_logged_in'] === true) {
    echo json_encode([
        "logged_in" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "name" => $_SESSION['user_name']
        ]
    ]);
} else {
    echo json_encode(["logged_in" => false]);
}
