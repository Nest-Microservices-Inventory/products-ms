import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { convertToSlug } from 'src/common/helpers';

@Injectable()
export class ProductsService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    const productExists = await this.prisma.products.findFirst({
      where: {
        name: createProductDto.name,
      }
    })

    if (productExists) {
      throw new BadRequestException("Ya se registro un producto con ese nombre");
    }

    const product = await this.prisma.products.create({
      data: {
        ...createProductDto,
        slug: convertToSlug(createProductDto.name),
      }
    })

    return {
      message: "Producto creado exitosamente",
      product
    };
  }

  async findAll() {
    const products = await this.prisma.products.findMany();
    return {
      products
    }
  }

  async findOne(slug: string) {
    const product = await this.prisma.products.findFirst({
      where: {
        slug
      }
    })
    if (!product) {
      throw new NotFoundException("no se encontro el producto")
    }

    return {
      product
    }
  }

  async update(slug: string, updateProductDto: UpdateProductDto) {

    const productoExist = await this.prisma.products.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug },
        ]
      }
    })

    if (!productoExist) {
      throw new NotFoundException("No se encontro el producto a actualizar");
    }

    if (updateProductDto.name) {
      updateProductDto.slug = convertToSlug(updateProductDto.name)
    }

    const product = await this.prisma.products.update({
      where:
        { id: productoExist?.id },
      data: {
        ...updateProductDto,
      }
    })

    return {
      message: "Producto actualizado correctamente",
      product
    };
  }

  async remove(slug: string) {
    const productExists = await this.prisma.products.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug }
        ]
      }
    })

    if (!productExists) {
      throw new NotFoundException("No se encontro el producto")
    }

    await this.prisma.products.delete({
      where: {
        id: productExists?.id
      }
    })

    return {
      message: "Producto Eliminado Correctamente"
    }
  }
}
