import ExpenseRepository from "../../../infra/repositories/ExpenseRepository";

export default class GetAllExpensesUseCase {
  expenseRepository?: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async execute(query: any) {
    return await this.expenseRepository?.getAll(query);
  }
}
