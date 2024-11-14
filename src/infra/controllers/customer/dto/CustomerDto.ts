import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsUUID,
} from "class-validator";

export default class CustomerDto {
  @IsOptional()
  @IsUUID()
  customerId!: string;

  @IsNotEmpty({ message: "Table is required" })
  @IsUUID()
  table_id!: string;

  @IsNotEmpty({ message: "Username is required" })
  @IsString({ message: "Username must be a string" })
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty({ message: "Active status is required" })
  @IsBoolean({ message: "Active must be a boolean" })
  active!: boolean;
}
