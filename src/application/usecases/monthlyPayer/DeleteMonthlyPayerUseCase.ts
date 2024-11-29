import MonthlyPayerRepository from "../../../infra/repositories/MonthlyPayerRepository";

export default class DeleteMonthlyPayerUseCase {
  monthlyPayerRepository?: MonthlyPayerRepository;

  constructor(monthlyPayerRepository: MonthlyPayerRepository) {
    this.monthlyPayerRepository = monthlyPayerRepository;
  }

  async execute(monthlyPayerId: string) {
    this.monthlyPayerRepository?.delete(monthlyPayerId);
  }
}
