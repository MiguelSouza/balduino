import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
} from "class-validator";
import { OrderStatus } from "../../../domain/Order";

class ProductDto {
  @IsNotEmpty({ message: "Product ID is required" })
  @IsUUID()
  productId!: string;

  @IsNotEmpty({ message: "Quantity is required" })
  @IsBoolean()
  quantity!: number;
}

export default class OrderDto {
  @IsOptional()
  @IsUUID()
  orderId!: string;

  @IsNotEmpty({ message: "Table is required" })
  @IsUUID()
  customer_id!: string;

  @IsArray({ message: "Products must be an array" })
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products!: ProductDto[];

  @IsOptional()
  @IsString()
  status!: OrderStatus;
}
