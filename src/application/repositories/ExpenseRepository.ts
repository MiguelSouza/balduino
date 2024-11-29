import Expense from "../../infra/domain/Expense";

export default interface IExpenseRepository {
  save(expense: Expense): Promise<Expense>;
  update(expense: Expense): void;
  getById(expenseId: string): Promise<Expense>;
  getAll(query: any): Promise<Expense[]>;
  delete(expenseId: string): void;
  getByDescription(description: string): Promise<Expense>;
}
