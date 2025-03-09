import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { convertToSlug } from 'src/common/helpers';
import { RpcException } from '@nestjs/microservices';

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
      throw new RpcException({
        statusCode: 400,
        message: "El producto ya existe"
      });
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
      throw new RpcException({
        statusCode: 400,
        message: "No se encontro el producto"
      })
    }

    return {
      product
    }
  }

  async update(slug: string, updateProductDto: UpdateProductDto) {
    const productExists = await this.prisma.products.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug }
        ]
      }
    })

    if (!productExists) {
      throw new RpcException({
        statusCode: 404,
        message: "No se encontro el producto"
      });
    }

    if (updateProductDto.name) {
      updateProductDto.slug = convertToSlug(updateProductDto.name)
    }

    const product = await this.prisma.products.update({
      where: {
        id: productExists?.id
      },
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
      throw new RpcException({
        statusCode: 400,
        message: "No se encontro el producto"
      })
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

  async validateProductsIds(ids: string[]) {
    ids = Array.from(new Set(ids));
    const products = await this.prisma.products.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    if (products.length !== ids.length) {
      throw new RpcException({
        message: "No se encontro algun producto",
        statusCode: 400
      })
    }

    return products
  }

  async updateProductStock(productsQuantity: { id: string, quantity: number }[]){

    const productIds = productsQuantity.map(product => product.id);

    const products = await this.prisma.products.findMany({
      where:{
        id: {
          in: productIds
        }
      }
    })

    products.map((product, index) => {
      if( product.stock < productsQuantity[index].quantity ){
        throw new RpcException({
          statusCode: 400,
          message: "Stock insuficiente"
        })
      }
    })


    products.map((product, index) => {
      const newStock = product.stock - productsQuantity[index].quantity;
      this.update(product.slug, {...product, stock: newStock});
    })

    return true;
  }
}
