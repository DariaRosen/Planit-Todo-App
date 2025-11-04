<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ store user data as nested array for clarity
if (isset($_SESSION['user']) && isset($_SESSION['user']['id'])) {
    echo json_encode([
        "logged_in" => true,
        "user" => $_SESSION['user']
    ]);
} else {
    // fallback for older session style
    if (isset($_SESSION['is_logged_in']) && $_SESSION['is_logged_in'] === true) {
        $_SESSION['user'] = [
            "id" => $_SESSION['user_id'] ?? null,
            "name" => $_SESSION['user_name'] ?? ""
        ];
        echo json_encode([
            "logged_in" => true,
            "user" => $_SESSION['user']
        ]);
    } else {
        echo json_encode(["logged_in" => false]);
    }
}
