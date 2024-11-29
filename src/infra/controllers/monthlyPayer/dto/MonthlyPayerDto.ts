import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
} from "class-validator";

export default class MonthlyPayerDto {
  @IsOptional()
  @IsUUID()
  monthlyPayerId!: string;

  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  name!: string;

  @IsNotEmpty({ message: "Value is required" })
  @IsNumber({}, { message: "Value must be a valid number" })
  value!: number;
}
