import CreateResponseDto from "../../../infra/controllers/table/dto/CreateResponseDto";
import TableDto from "../../../infra/controllers/table/dto/TableDto";
import Table from "../../../infra/domain/Table";
import TableRepository from "../../../infra/repositories/TableRepository";

export default class CreateTableUseCase {
  tableRepository?: TableRepository;

  constructor(tableRepository: TableRepository) {
    this.tableRepository = tableRepository;
  }

  async execute(user: TableDto): Promise<CreateResponseDto> {
    try {
      const tableEntity = new Table({
        name: user.name,
        active: user.active
      });
      const response = await this.tableRepository?.save(tableEntity);
      return {
        table: response,
      };
    } catch (err: any) {
      return {
        table: undefined,
        errorMessage: err.message,
      };
    }
  }
}
