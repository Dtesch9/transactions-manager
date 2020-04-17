import { getCustomRepository } from 'typeorm';
import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (req, res) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const balance = await transactionsRepository.getBalance();

  return res.json(balance);
});

transactionsRouter.post('/', async (req, res) => {
  const { title, category, value, type } = req.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    category,
    value,
    type,
  });

  return res.json(transaction);
});

// transactionsRouter.delete('/:id', async (req, res) => {
//   // TODO
// });

// transactionsRouter.post('/import', async (req, res) => {
//   // TODO
// });

export default transactionsRouter;
