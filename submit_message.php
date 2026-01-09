<?php
header('Content-Type: application/json');
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

if (empty($input['name']) || empty($input['email']) || empty($input['comment'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields (Name, Email, Comment)']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO messages (name, email, phone, comment) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $input['name'],
        $input['email'],
        $input['phone'] ?? null,
        $input['comment']
    ]);

    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>