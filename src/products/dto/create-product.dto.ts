import { IsInt, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateProductDto {
    @IsString({ message: "El nombre debe ser un texto" })
    name: string;

    @IsString({ message: "La descripcion debe ser un texto" })
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: "El precio de venta no es valido" })
    priceSale: number;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: "El precio de compra no es valido" })
    PricePurchase: number;

    @IsOptional()
    slug?: string;

    @IsNumber()
    @IsPositive()
    @IsInt()
    stock: number;
}
