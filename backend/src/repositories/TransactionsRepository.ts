import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const totalBalance = this.transactions.reduce(
      (balanceCalc, transaction) => {
        if (transaction.type === 'income') {
          balanceCalc.income += transaction.value;
        } else {
          balanceCalc.outcome += transaction.value;
        }

        balanceCalc.total = balanceCalc.income - balanceCalc.outcome;

        return balanceCalc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return totalBalance;
  }

  public create({ title, value, type }: CreateTransactionDTO): Transaction {
    const transaction = new Transaction({ title, value, type });

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
