<?php
require '../config/session_init.php';
require '../config/db.php';
header('Content-Type: application/json');

// 5 attempts per 60 seconds per session
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['login_window_start'] = time();
}

if (time() - $_SESSION['login_window_start'] > 60) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['login_window_start'] = time();
}

if ($_SESSION['login_attempts'] >= 5) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many attempts. Please wait a minute and try again.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password required']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password_hash'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['login_attempts'] = 0; // reset when pass
    echo json_encode(['success' => true]);
} else {
    $_SESSION['login_attempts']++;
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}

?>