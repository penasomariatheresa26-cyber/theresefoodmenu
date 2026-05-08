const express = require('express');
const router = express.Router();
const db = require('../db');

// GET wallet balance and transactions
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user balance
    const userResult = await db.query(
      'SELECT wallet_balance FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get transactions
    const txnResult = await db.query(
      'SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({
      balance: parseFloat(userResult.rows[0].wallet_balance),
      transactions: txnResult.rows.map(txn => ({
        id: txn.id,
        type: txn.type,
        amount: parseFloat(txn.amount),
        description: txn.description,
        date: txn.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// POST top up wallet
router.post('/:userId/topup', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { userId } = req.params;
    const { amount } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Update balance
    const userResult = await client.query(
      'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance',
      [amount, userId]
    );
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create transaction record
    const txnId = `txn-${Date.now()}`;
    await client.query(
      `INSERT INTO wallet_transactions (id, user_id, type, amount, description)
       VALUES ($1, $2, 'topup', $3, 'Wallet top-up')`,
      [txnId, userId, amount]
    );
    
    await client.query('COMMIT');
    
    res.json({
      balance: parseFloat(userResult.rows[0].wallet_balance),
      transaction: {
        id: txnId,
        type: 'topup',
        amount: amount,
        description: 'Wallet top-up',
        date: new Date().toISOString()
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error topping up wallet:', error);
    res.status(500).json({ error: 'Failed to top up wallet' });
  } finally {
    client.release();
  }
});

// POST deduct from wallet
router.post('/:userId/deduct', async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { userId } = req.params;
    const { amount, description } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Check balance and deduct
    const userResult = await client.query(
      `UPDATE users 
       SET wallet_balance = wallet_balance - $1 
       WHERE id = $2 AND wallet_balance >= $1
       RETURNING wallet_balance`,
      [amount, userId]
    );
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance or user not found' });
    }
    
    // Create transaction record
    const txnId = `txn-${Date.now()}`;
    await client.query(
      `INSERT INTO wallet_transactions (id, user_id, type, amount, description)
       VALUES ($1, $2, 'payment', $3, $4)`,
      [txnId, userId, amount, description || 'Payment']
    );
    
    await client.query('COMMIT');
    
    res.json({
      balance: parseFloat(userResult.rows[0].wallet_balance),
      transaction: {
        id: txnId,
        type: 'payment',
        amount: amount,
        description: description || 'Payment',
        date: new Date().toISOString()
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deducting from wallet:', error);
    res.status(500).json({ error: 'Failed to deduct from wallet' });
  } finally {
    client.release();
  }
});

module.exports = router;
