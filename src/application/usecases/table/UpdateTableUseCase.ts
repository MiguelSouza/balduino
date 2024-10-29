import TableDto from "../../../infra/controllers/table/dto/TableDto";
import Table from "../../../infra/domain/Table";
import TableRepository from "../../../infra/repositories/TableRepository";

export default class UpdateTableUseCase {
  tableRepository?: TableRepository;

  constructor(tableRepository: TableRepository) {
    this.tableRepository = tableRepository;
  }

  async execute(table: TableDto): Promise<void> {
    const oldTable = await this.tableRepository?.getById(table.tableId);
    const newTable = new Table(oldTable as Table);
    newTable.update({
      name: table.name,
      active: table.active,
    });
    await this.tableRepository?.update(newTable);
  }
}
