import Table from "../../infra/domain/Table";

export default interface ITableRepository {
  save(table: Table): Promise<Table>;
  update(table: Table): void;
  getById(tableId: string): Promise<Table>;
  getAll(query: any): Promise<Table[]>;
  delete(tableId: string): void;
}
