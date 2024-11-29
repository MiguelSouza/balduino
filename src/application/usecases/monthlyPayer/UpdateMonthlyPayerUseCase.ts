import MonthlyPayerDto from "../../../infra/controllers/monthlyPayer/dto/MonthlyPayerDto";
import MonthlyPayer from "../../../infra/domain/MonthlyPayers";
import MonthlyPayerRepository from "../../../infra/repositories/MonthlyPayerRepository";

export default class UpdateMonthlyPayerUseCase {
  monthlyPayerRepository?: MonthlyPayerRepository;

  constructor(monthlyPayerRepository: MonthlyPayerRepository) {
    this.monthlyPayerRepository = monthlyPayerRepository;
  }

  async execute(monthlyPayer: MonthlyPayerDto): Promise<void> {
    const oldMonthlyPayer = await this.monthlyPayerRepository?.getById(monthlyPayer.monthlyPayerId);
    const newMonthlyPayer = new MonthlyPayer(oldMonthlyPayer as MonthlyPayer);
    newMonthlyPayer.update({
      name: monthlyPayer.name,
      value: monthlyPayer.value
    });
    await this.monthlyPayerRepository?.update(newMonthlyPayer);
  }
}
