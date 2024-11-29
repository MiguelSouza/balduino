import MonthlyPayerRepository from "../../../infra/repositories/MonthlyPayerRepository";

export default class GetMonthlyPayerByIdUseCase {
  monthlyPayerRepository?: MonthlyPayerRepository;

  constructor(monthlyPayerRepository: MonthlyPayerRepository) {
    this.monthlyPayerRepository = monthlyPayerRepository;
  }

  async execute(monthlyPayerId: string) {
    return await this.monthlyPayerRepository?.getById(monthlyPayerId);
  }
}
