import { getConnection, getCustomRepository, In } from 'typeorm';
import parse from 'csv-parse';
import { join } from 'path';
import fs from 'fs';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  transactionsFilename: string;
}

interface FileCsv {
  title: string;
  type: 'income' | 'outcome';
  category: string;
  value: number;
}

class ImportTransactionService {
  public async execute({
    transactionsFilename,
  }: Request): Promise<Transaction[]> {
    const csvFilePath = join(uploadConfig.directory, transactionsFilename);

    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const csvStream = fs
      .createReadStream(csvFilePath)
      .pipe(parse({ from_line: 2 }));

    const csvTransactions: FileCsv[] = [];
    const csvCategories: string[] = [];

    csvStream.on('data', async row => {
      const [title, type, value, category] = row.map((line: string) =>
        line.trim(),
      );

      if (!title || !type || !value) return;

      csvCategories.push(category);

      csvTransactions.push({ title, type, value, category });
    });

    await new Promise(resolve => csvStream.on('end', resolve));

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(csvCategories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = csvCategories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((category, index, self) => self.indexOf(category) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const allExistentCategories = [...newCategories, ...existentCategories];

    const transactions = transactionsRepository.create(
      csvTransactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allExistentCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(transactions);

    await fs.promises.unlink(csvFilePath);

    return transactions;
  }
}

export default ImportTransactionService;
