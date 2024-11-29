import ExpenseRepository from "../../../infra/repositories/ExpenseRepository";

export default class DeleteExpenseUseCase {
  expenseRepository?: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async execute(expenseId: string) {
    this.expenseRepository?.delete(expenseId);
  }
}
