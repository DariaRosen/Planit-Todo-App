<?php
// --- Global CORS configuration ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

// Allowed origins (add others if needed)
$allowed_origins = [
    'http://localhost:5173',  // your Vite app
    'http://localhost',       // XAMPP Apache
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
