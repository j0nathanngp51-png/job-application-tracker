<?php

// so that the applicaiton gets an update when we got declined or not

require '../config/session_init.php';
require '../config/db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? null;
$company_name = trim($data['company_name'] ?? '');
$job_title = trim($data['job_title'] ?? '');
$status = $data['status'] ?? 'Applied';
$date_applied = $data['date_applied'] ?? null;
$job_url = trim($data['job_url'] ?? '');
$notes = trim($data['notes'] ?? '');

$allowed_statuses = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid application id is required']);
    exit;
}

if (!$company_name || !$job_title) {
    http_response_code(400);
    echo json_encode(['error' => 'Company name and job title are required']);
    exit;
}

if (strlen($company_name) > 100 || strlen($job_title) > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Company name or job title too long']);
    exit;
}

if (strlen($notes) > 2000) {
    http_response_code(400);
    echo json_encode(['error' => 'Notes too long']);
    exit;
}

if (!in_array($status, $allowed_statuses)) {
    $status = 'Applied';
}

$stmt = $pdo->prepare("UPDATE applications SET company_name = ?, job_title = ?, status = ?, date_applied = ?, job_url = ?, notes = ? WHERE id = ? AND user_id = ?");
$stmt->execute([
    $company_name,
    $job_title,
    $status,
    $date_applied,
    $job_url,
    $notes,
    $id,
    $_SESSION['user_id']
]);
echo json_encode(['success' => true]);
?>