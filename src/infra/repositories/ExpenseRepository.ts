import IExpenseRepository from "../../application/repositories/ExpenseRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Expense from "../domain/Expense";

export default class ExpenseRepository implements IExpenseRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  async save(expense: Expense): Promise<Expense> {
    return this.connection?.query(
      "insert into balduino.expense (expense_id, description, value, created_at, updated_at) values ($1, $2, $3, $4, $5) RETURNING *",
      [
        expense.expenseId,
        expense.description,
        expense.value,
        expense.createdAt,
        expense.updatedAt,
      ],
    );
  }

  async update(expense: Expense): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.expense
            SET description = $1, value = $2, editable = $3, updated_at = $4
            WHERE expense_id = $5`,
      [
        expense.description,
        expense.value,
        new Date(),
        expense.expenseId,
      ],
    );
  }

  async getByDescription(description: string): Promise<Expense> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.expense WHERE description like '%$1%'",
      [description],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getById(expenseId: string): Promise<Expense> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.expense WHERE expense_id = $1",
      [expenseId],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getAll(query: any): Promise<Expense[]> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
  
    return this.connection?.query(
      "SELECT * FROM balduino.expense WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2",
      [currentMonth, currentYear]
    );
  }
  

  async delete(expenseId: string): Promise<void> {
    this.connection?.query(
      "delete from balduino.expense where expense_id = $1",
      [expenseId],
    );
  }
}
