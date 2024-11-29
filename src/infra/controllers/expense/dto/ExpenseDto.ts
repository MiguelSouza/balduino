import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
} from "class-validator";

export default class ExpenseDto {
  @IsOptional()
  @IsUUID()
  expenseId!: string;

  @IsNotEmpty({ message: "Description is required" })
  @IsString({ message: "Name must be a string" })
  description!: string;

  @IsNotEmpty({ message: "Value is required" })
  @IsNumber({}, { message: "Value must be a valid number" })
  value!: number;
}
