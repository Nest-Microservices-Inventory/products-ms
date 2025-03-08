import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @MessagePattern("createProduct")
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern("findAllProducts")
  findAll() {
    return this.productsService.findAll();
  }

  @MessagePattern('findOneProduct')
  findOne(@Payload() slug: string) {
    return this.productsService.findOne(slug);
  }

  @MessagePattern('updateProduct')
  update(@Payload() slug: string, updateProductDto: UpdateProductDto) {
    return this.productsService.update(slug, updateProductDto);
  }

  @MessagePattern('removeProduct')
  remove(@Payload() slug: string) {
    return this.productsService.remove(slug);
  }
}
