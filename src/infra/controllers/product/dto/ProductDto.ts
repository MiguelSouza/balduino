import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
} from "class-validator";

export default class ProductDto {
  @IsOptional()
  @IsUUID()
  productId!: string;

  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  name!: string;

  @IsOptional()
  @IsString({ message: "Image must be a string" })
  image?: string;

  @IsNotEmpty({ message: "Value is required" })
  @IsNumber({}, { message: "Value must be a valid number" })
  value!: number;

  @IsNotEmpty({ message: "Active status is required" })
  @IsBoolean({ message: "Active must be a boolean" })
  active!: boolean;
}