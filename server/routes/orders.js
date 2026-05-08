const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all orders (admin) or user orders
router.get('/', async (req, res) => {
  try {
    const { user_id, is_admin } = req.query;
    
    let query = `
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'quantity', oi.quantity,
            'price', oi.price,
            'menu_item', json_build_object(
              'id', m.id,
              'name', m.name,
              'description', m.description,
              'price', m.price,
              'image', m.image,
              'category', m.category
            )
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items m ON oi.menu_item_id = m.id
    `;
    
    const params = [];
    
    if (is_admin !== 'true' && user_id) {
      query += ' WHERE o.user_id = $1';
      params.push(user_id);
    }
    
    query += ' GROUP BY o.id ORDER BY o.created_at DESC';
    
    const result = await db.query(query, params);
    
    // Transform to match frontend format
    const orders = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      address: row.address,
      phone: row.phone,
      paymentMethod: row.payment_method,
      status: row.status,
      total: parseFloat(row.total),
      createdAt: row.created_at,
      items: row.items[0]?.menu_item ? row.items.map(item => ({
        menuItem: item.menu_item,
        quantity: item.quantity
      })) : []
    }));
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST new order
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id, user_id, customer_name, address, phone, payment_method, total, items } = req.body;
    
    // Insert order
    const orderResult = await client.query(
      `INSERT INTO orders (id, user_id, customer_name, address, phone, payment_method, status, total)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
       RETURNING *`,
      [id, user_id, customer_name, address, phone, payment_method, total]
    );
    
    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [id, item.menuItem.id, item.quantity, item.menuItem.price]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      ...orderResult.rows[0],
      items
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
