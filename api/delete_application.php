<?php

// to delete the application

require '../config/session_init.php';
require '../config/db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$stmt = $pdo->prepare("DELETE FROM applications WHERE id = ? AND user_id = ?");
$stmt->execute([$data['id'], $_SESSION['user_id']]);
echo json_encode(['success' => true]);

?>