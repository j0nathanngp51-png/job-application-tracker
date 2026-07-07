<?php
require '../config/session_init.php';

require '../config/db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}


// fr grabbing the applciaiton adn geting the applied date

$stmt = $pdo->prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY date_applied DESC");

$stmt->execute([$_SESSION['user_id']]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

?>