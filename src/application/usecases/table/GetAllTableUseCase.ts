import TableRepository from "../../../infra/repositories/TableRepository";

export default class GetAllTableUseCase {
  tableRepository?: TableRepository;

  constructor(tableRepository: TableRepository) {
    this.tableRepository = tableRepository;
  }

  async execute() {
    return await this.tableRepository?.getAll();
  }
}