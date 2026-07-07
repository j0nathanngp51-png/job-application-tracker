<?php
// to register to the website

require '../config/session_init.php';
require '../config/db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username']);
$password = $data['password'];

if(!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'username and password required']);
    exit;
}


$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");

try {
    $stmt->execute([$username, $hash]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(409);
    echo json_encode(['error' => 'Username already taken']);
}

?>