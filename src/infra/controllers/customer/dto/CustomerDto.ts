import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export enum DayOfWeek {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday',
}

class CustomerTableDto {
  @IsNotEmpty({ message: "Customer ID is required" })
  @IsUUID()
  customer_id!: string;

  @IsNotEmpty({ message: "Table ID is required" })
  @IsUUID()
  table_id!: string;

  @IsNotEmpty({ message: "Day of week is required" })
  @IsEnum(DayOfWeek, { message: "Day of week must be a valid day" })
  day_of_week!: DayOfWeek;
}

export default class CustomerDto {
  @IsOptional()
  @IsUUID()
  customerId!: string;

  @IsNotEmpty({ message: "Username is required" })
  @IsString({ message: "Username must be a string" })
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty({ message: "Active status is required" })
  @IsBoolean({ message: "Active must be a boolean" })
  active!: boolean;

  @IsArray({ message: "Customer table must be an array" })
  @ValidateNested({ each: true })
  @Type(() => CustomerTableDto)
  customerTables!: CustomerTableDto[];
}
