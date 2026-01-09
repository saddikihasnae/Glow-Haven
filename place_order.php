<?php
header('Content-Type: application/json');
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

// Validate required fields
$required = ['customer_name', 'phone', 'address', 'city', 'total_amount', 'items'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit;
    }
}

try {
    $pdo->beginTransaction();

    // Insert Order
    $stmt = $pdo->prepare("INSERT INTO orders (customer_name, phone, email, address, city, total_amount) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['customer_name'],
        $input['phone'],
        $input['email'] ?? null,
        $input['address'],
        $input['city'],
        $input['total_amount']
    ]);

    $orderId = $pdo->lastInsertId();

    // Insert Items
    $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($input['items'] as $item) {
        $stmtItem->execute([
            $orderId,
            $item['name'],
            $item['quantity'],
            $item['price']
        ]);
    }

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Order placed successfully', 'order_id' => $orderId]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>