import MonthlyPayerRepository from "../../../infra/repositories/MonthlyPayerRepository";

export default class GetAllMonthlyPayerUseCase {
  monthlyPayerRepository?: MonthlyPayerRepository;

  constructor(monthlyPayerRepository: MonthlyPayerRepository) {
    this.monthlyPayerRepository = monthlyPayerRepository;
  }

  async execute(query: any) {
    return await this.monthlyPayerRepository?.getAll(query);
  }
}
