import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

interface RequestDTO {
  category: string;
}

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findOneOrCreate({ category }: RequestDTO): Promise<Category> {
    const existentCategory = await this.findOne({
      where: { title: category },
    });

    if (!existentCategory) {
      const newCategory = this.create({
        title: category,
      });

      await this.save(newCategory);

      return newCategory;
    }

    return existentCategory;
  }
}

export default CategoriesRepository;
