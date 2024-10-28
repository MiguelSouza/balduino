import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsDate,
  IsUUID,
} from "class-validator";

export default class UserDto {
  @IsOptional()
  @IsUUID()
  userId!: string;

  @IsNotEmpty({ message: "Username is required" })
  @IsString({ message: "Username must be a string" })
  name!: string;

  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Email is invalid" })
  email!: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString({ message: "Password must be a string" })
  password!: string;

  @IsOptional()
  @IsDate({ message: "Birthday must be a valid date" })
  birthday?: Date;

  @IsOptional()
  @IsString({ message: "Birthday must be a valid date" })
  cpf?: string;

  @IsNotEmpty({ message: "Admin status is required" })
  @IsBoolean({ message: "Admin must be a boolean" })
  admin!: boolean;

  @IsNotEmpty({ message: "Active status is required" })
  @IsBoolean({ message: "Active must be a boolean" })
  active!: boolean;
}
