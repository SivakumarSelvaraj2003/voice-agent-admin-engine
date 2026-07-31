import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // 1. Fetch the master orders with customer name and address
        const [orders] = await pool.query(`
            SELECT 
                o.id, o.total_amount, o.order_status, 
                DATE_FORMAT(o.order_date, "%Y-%m-%d %h:%i %p") as order_date,
                DATE_FORMAT(o.shipped_date, "%Y-%m-%d %h:%i %p") as shipped_date,
                DATE_FORMAT(o.expected_delivery_date, "%Y-%m-%d %h:%i %p") as expected_delivery_date,
                DATE_FORMAT(o.cancelled_date, "%Y-%m-%d %h:%i %p") as cancelled_date,
                u.name as customer_name, u.phone_number,
                a.address_text
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN addresses a ON o.address_id = a.id
            ORDER BY o.id DESC
        `);

        // 2. Fetch all cart items with product names
        const [items] = await pool.query(`
            SELECT 
                oi.order_id, p.name as product_name, oi.quantity, oi.item_total
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
        `);

        // 3. Snap the items perfectly into their matching master order
        const ordersWithItems = orders.map(order => {
            return {
                ...order,
                items: items.filter(item => item.order_id === order.id)
            };
        });

        res.json({ success: true, orders: ordersWithItems });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// ADMIN BLOCK: Update Order Status
// ==========================================
router.post('/update-status', async (req, res) => {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ success: false, message: 'Missing orderId or status' });
    }

    try {
        await pool.query(
            "UPDATE orders SET order_status = ? WHERE id = ?", 
            [status, orderId]
        );
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error("Admin Status Update Error:", error);
        res.status(500).json({ success: false, message: 'Database update failed' });
    }
});

export default router;