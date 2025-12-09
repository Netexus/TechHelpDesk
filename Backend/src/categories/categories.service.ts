import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    create(createCategoryDto: CreateCategoryDto) {
        const category = this.categoriesRepository.create(createCategoryDto);
        return this.categoriesRepository.save(category);
    }

    findAll() {
        return this.categoriesRepository.find();
    }

    findOne(id: string) {
        return this.categoriesRepository.findOne({ where: { id } });
    }

    async remove(id: string) {
        await this.categoriesRepository.delete(id);
    }
}
