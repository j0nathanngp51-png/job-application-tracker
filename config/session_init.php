<?php
// secure session settings
ini_set('session.cookie_httponly', 1);   // JS can't read the cookie
ini_set('session.use_strict_mode', 1);   // rejects uninitialized session IDs
ini_set('session.cookie_samesite', 'Lax'); // limits cross-site cookie sending

session_start();

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

?>