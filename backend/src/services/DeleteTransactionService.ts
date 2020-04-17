import { getCustomRepository } from 'typeorm';

import TransactionsRepositories from '../repositories/TransactionsRepository';

import AppError from '../error/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepositories = getCustomRepository(
      TransactionsRepositories,
    );

    const transaction = await transactionsRepositories.find({
      where: { id },
    });

    if (!transaction) {
      throw new AppError('Transaction does not exist', 401);
    }

    await transactionsRepositories.remove(transaction);
  }
}

export default DeleteTransactionService;
