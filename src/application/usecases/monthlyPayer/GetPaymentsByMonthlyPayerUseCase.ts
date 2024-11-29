import MonthlyPayerRepository from "../../../infra/repositories/MonthlyPayerRepository";

export default class GetPaymentsByMonthlyPayerUseCase {
  monthlyPayerRepository?: MonthlyPayerRepository;

  constructor(monthlyPayerRepository: MonthlyPayerRepository) {
    this.monthlyPayerRepository = monthlyPayerRepository;
  }

  async execute(monthlyPayerId: string) {
    return await this.monthlyPayerRepository?.getPaymentsByMonthlyPayer(monthlyPayerId);
  }
}
