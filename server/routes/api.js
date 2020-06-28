const express = require('express');
const router = express.Router();
const app = express();

var controllers = require('../controllers/index.js');

// Expense Controller
// router.get('/indexExpenseList', controllers.expense.indexExpenseList);
// router.post('/insertExpense', controllers.expense.insertExpense);
// router.post('/destroyExpense', controllers.expense.destroyExpense);

// Options Controller
router.get('/getSkewData', controllers.options.getSkewData);

module.exports = router;

