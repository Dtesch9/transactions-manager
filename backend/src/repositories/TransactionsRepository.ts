import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  transactions: Transaction[];
  balance: {
    income: number;
    outcome: number;
    total: number;
  };
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({
      select: ['id', 'title', 'value', 'type'],
      relations: ['category'],
    });

    const totalBalance = transactions.reduce(
      (balanceCalc, transaction) => {
        const { type } = transaction;

        balanceCalc[type] += transaction.value;

        balanceCalc.total = balanceCalc.income - balanceCalc.outcome;

        return balanceCalc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return { transactions, balance: totalBalance };
  }
}

export default TransactionsRepository;
