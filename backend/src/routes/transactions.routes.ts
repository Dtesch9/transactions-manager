import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';

const transactionsRouter = Router();

const transactionsRepository = new TransactionsRepository();

transactionsRouter.get('/', (req, res) => {
  try {
    const transactions = transactionsRepository.all();

    const balance = transactionsRepository.getBalance();

    return res.json({
      transactions,
      balance,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

transactionsRouter.post('/', (req, res) => {
  try {
    const { title, value, type } = req.body;

    const createTransactionService = new CreateTransactionService(
      transactionsRepository,
    );

    const transaction = createTransactionService.execute({
      title,
      value,
      type,
    });

    return res.json(transaction);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

transactionsRouter.delete('/:id', async (req, res) => {
  // TODO
});

transactionsRouter.post('/import', async (req, res) => {
  // TODO
});

export default transactionsRouter;
