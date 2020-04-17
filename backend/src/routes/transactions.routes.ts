import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionService from '../services/ImportTransactionService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

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

transactionsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute({
    id,
  });

  return res.status(204).json();
});

transactionsRouter.post('/import', upload.single('file'), async (req, res) => {
  const importTransactionService = new ImportTransactionService();

  const transactions = await importTransactionService.execute({
    transactionsFilename: req.file.filename,
  });

  return res.json(transactions);
});

export default transactionsRouter;
