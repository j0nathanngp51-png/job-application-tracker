<?php

$host = 'localhost';
$db = 'JOB-TRACKER';
$user = 'root';
$pass = 'MyDingaling445';

try{
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Connection failed: ' . $e->getMessage()]));
}

?>