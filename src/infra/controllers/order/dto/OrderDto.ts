import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
} from "class-validator";
import { OrderStatus } from "../../../domain/Order";

class ProductDto {
  @IsNotEmpty({ message: "Product ID is required" })
  @IsUUID()
  productId!: string;

  @IsNotEmpty({ message: "Quantity is required" })
  @IsNumber()
  quantity!: number;

  @IsNotEmpty({ message: "Price is required" })
  @IsNumber()
  price!: number;
}

export default class OrderDto {
  @IsOptional()
  @IsUUID()
  orderId!: string;

  @IsNotEmpty({ message: "Customer is required" })
  @IsUUID()
  customer_id!: string;

  @IsNotEmpty({ message: "Table is required" })
  @IsUUID()
  table_id!: string;

  @IsOptional()
  @IsUUID()
  created_by?: string;

  @IsArray({ message: "Products must be an array" })
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products!: ProductDto[];

  @IsOptional()
  @IsString()
  status!: OrderStatus;
}
