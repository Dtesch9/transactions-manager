import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  category: string;
  value: number;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    category,
    value,
    type,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type !== 'income' && type !== 'outcome') {
      throw Error('Type not allowed');
    }

    const {
      balance: { total },
    } = await transactionsRepository.getBalance();

    const negativeBalanceAfterOutcome = type === 'outcome' && total - value < 0;

    if (negativeBalanceAfterOutcome) {
      throw Error('Transactions that let your negative balance not allowed');
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const { id } = await categoriesRepository.findOneOrCreate({
      category,
    });

    const transaction = transactionsRepository.create({
      title,
      category_id: id,
      value,
      type,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
