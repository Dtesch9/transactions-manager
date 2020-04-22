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
    const transactions = await this.find();

    const totalBalance = transactions.reduce(
      (balanceCalc, transaction) => {
        const { type, value } = transaction;

        balanceCalc[type] += Number(value);

        return balanceCalc;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    const balance = {
      ...totalBalance,
      total: totalBalance.income - totalBalance.outcome,
    };

    return { transactions, balance };
  }
}

export default TransactionsRepository;
