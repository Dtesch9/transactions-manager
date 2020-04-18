import parse from 'csv-parse';
import { join } from 'path';
import fs from 'fs';
import { getConnection, getCustomRepository } from 'typeorm';

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

    const csvStream = fs
      .createReadStream(csvFilePath)
      .pipe(parse({ from_line: 2 }));

    const csvTransactions: FileCsv[] = [];

    csvStream.on('data', async row => {
      const results = row.map((line: string) => line.trim(), []);

      const [title, type, value, category] = results;

      csvTransactions.push({ title, type, value, category });
    });

    await new Promise(resolve => csvStream.on('end', resolve));

    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categories = await categoriesRepository.find();

    const CategoriesDifferentFromExistents = csvTransactions
      .map(transaction => {
        const hasDifferentCategory = !!categories.filter(
          cat => transaction.category !== cat.title,
        );

        return hasDifferentCategory && transaction;
      })
      .map(eachCategory => ({ category: eachCategory.category }));

    const csvCategories = CategoriesDifferentFromExistents.map(
      cat => cat.category,
    )
      .filter((category, index, categoriesArray) => {
        return categoriesArray.indexOf(category) === index;
      })
      .map(category => categoriesRepository.create({ title: category }));

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values(csvCategories)
      .execute();

    console.log(csvCategories);

    const allExistentCategories = [...categories, ...csvCategories];

    const transactions = csvTransactions.map(
      ({ category, title, type, value }) => {
        const foundCategory = allExistentCategories.find(
          cat => cat.title === category,
        );

        return transactionsRepository.create({
          title,
          category_id: foundCategory?.id,
          value,
          type,
        });
      },
    );

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Transaction)
      .values(transactions)
      .execute();

    await fs.promises.unlink(csvFilePath);

    return transactions;
  }
}

export default ImportTransactionService;
