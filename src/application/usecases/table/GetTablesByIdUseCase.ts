import TableRepository from "../../../infra/repositories/TableRepository";

export default class GetTablesByIdUseCase {
  tableRepository?: TableRepository;

  constructor(tableRepository: TableRepository) {
    this.tableRepository = tableRepository;
  }

  async execute(tableId: string) {
    return await this.tableRepository?.getById(tableId);
  }
}
