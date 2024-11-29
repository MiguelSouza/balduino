import MonthlyPayer from "../../infra/domain/MonthlyPayers";
import Payment from "../../infra/domain/Payment";

export default interface IMonthlyPayerRepository {
  save(monthlyPayer: MonthlyPayer): Promise<MonthlyPayer>;
  update(monthlyPayer: MonthlyPayer): void;
  getById(monthlyPayerId: string): Promise<MonthlyPayer>;
  getPaymentsByMonthlyPayer(monthlyPayerId: string): Promise<Payment[]>;
  getAll(query: any): Promise<MonthlyPayer[]>;
  delete(monthlyPayerId: string): void;
  getByName(name: string): Promise<MonthlyPayer>;
}
