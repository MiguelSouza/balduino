import MonthlyPayerDto from "../../../infra/controllers/monthlyPayer/dto/MonthlyPayerDto";
import CreateResponseDto from "../../../infra/controllers/monthlyPayer/dto/CreateResponseDto";
import MonthlyPayer from "../../../infra/domain/MonthlyPayers";
import MonthlyPayerRepository from "../../../infra/repositories/MonthlyPayerRepository";

export default class CreateMonthlyPayerUseCase {
  monthlyPayerRepository?: MonthlyPayerRepository;

  constructor(monthlyPayerRepository: MonthlyPayerRepository) {
    this.monthlyPayerRepository = monthlyPayerRepository;
  }

  async execute(monthlyPayer: MonthlyPayerDto): Promise<CreateResponseDto> {
    try {
      const monthlyPayerEntity = new MonthlyPayer({
        name: monthlyPayer.name,
        value: monthlyPayer.value,
      });
      const response = await this.monthlyPayerRepository?.save(monthlyPayerEntity);
      return {
        monthlyPayer: response,
      };
    } catch (err: any) {
      return {
        monthlyPayer: undefined,
        errorMessage: err.message,
      };
    }
  }
}
