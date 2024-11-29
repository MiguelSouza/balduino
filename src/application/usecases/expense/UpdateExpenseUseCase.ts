import ExpenseDto from "../../../infra/controllers/expense/dto/ExpenseDto";
import Expense from "../../../infra/domain/Expense";
import ExpenseRepository from "../../../infra/repositories/ExpenseRepository";

export default class UpdateExpenseUseCase {
  expenseRepository?: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async execute(expense: ExpenseDto): Promise<void> {
    const oldExpense = await this.expenseRepository?.getById(expense.expenseId);
    const newExpense = new Expense(oldExpense as Expense);
    newExpense.update({
      description: expense.description,
      value: expense.value
    });
    await this.expenseRepository?.update(newExpense);
  }
}
