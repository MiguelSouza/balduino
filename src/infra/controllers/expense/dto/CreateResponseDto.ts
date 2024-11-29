import Expense from "../../../domain/Expense";

export default interface CreateResponseDto {
  expense?: Expense;
  errorMessage?: string;
  errorStatus?: number;
}
