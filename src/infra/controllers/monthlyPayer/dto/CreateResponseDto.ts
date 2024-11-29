import MonthlyPayer from "../../../domain/MonthlyPayers";

export default interface CreateResponseDto {
  monthlyPayer?: MonthlyPayer;
  errorMessage?: string;
  errorStatus?: number;
}
