import ExpenseDto from "../../../infra/controllers/expense/dto/ExpenseDto";
import CreateResponseDto from "../../../infra/controllers/expense/dto/CreateResponseDto";
import Expense from "../../../infra/domain/Expense";
import ExpenseRepository from "../../../infra/repositories/ExpenseRepository";

export default class CreateExpenseUseCase {
  expenseRepository?: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async execute(expense: ExpenseDto): Promise<CreateResponseDto> {
    try {
      const expenseEntity = new Expense({
        description: expense.description,
        value: expense.value
      });
      const response = await this.expenseRepository?.save(expenseEntity);
      return {
        expense: response,
      };
    } catch (err: any) {
      return {
        expense: undefined,
        errorMessage: err.message,
      };
    }
  }
}
