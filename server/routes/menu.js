const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM menu_items ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// GET single menu item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// POST new menu item
router.post('/', async (req, res) => {
  try {
    const { id, name, description, price, image, category, available, featured } = req.body;
    
    const result = await db.query(
      `INSERT INTO menu_items (id, name, description, price, image, category, available, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, name, description, price, image, category, available ?? true, featured ?? false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PUT update menu item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, available, featured } = req.body;
    
    const result = await db.query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, image = $4, 
           category = $5, available = $6, featured = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, description, price, image, category, available, featured, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// DELETE menu item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

module.exports = router;
