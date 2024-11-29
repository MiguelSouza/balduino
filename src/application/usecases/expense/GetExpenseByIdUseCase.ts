import ExpenseRepository from "../../../infra/repositories/ExpenseRepository";

export default class GetExpenseByIdUseCase {
  expenseRepository?: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async execute(expenseId: string) {
    return await this.expenseRepository?.getById(expenseId);
  }
}
