import TableRepository from "../../../infra/repositories/TableRepository";

export default class DeleteTableUseCase {
  tableRepository?: TableRepository;

  constructor(tableRepository: TableRepository) {
    this.tableRepository = tableRepository;
  }

  async execute(tableId: string) {
    this.tableRepository?.delete(tableId);
  }
}
