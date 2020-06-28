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
router.get('/getOptionsData/:symbol/:expirationDate', controllers.options.getOptionsData);
router.get('/getSingleOptionData/:symbol/:strike/:putCall/:dte', controllers.options.getSingleOptionData);

module.exports = router;

