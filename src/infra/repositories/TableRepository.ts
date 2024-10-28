import ITableRepository from "../../application/repositories/TableRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Table from "../domain/Table";

export default class TableRepository implements ITableRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  async save(table: Table): Promise<Table> {
    return this.connection?.query(
      "insert into balduino.table (table_id, name, active, created_at, updated_at) values ($1, $2, $3, $4, $5) RETURNING *",
      [
        table.tableId,
        table.name,
        table.active,
        table.createdAt,
        table.updatedAt,
      ],
    );
  }

  async update(table: Table): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.table
            SET name = $1, active = $2, updated_at = $3
            WHERE table_id = $4`,
      [table.name, table.active, new Date(), table.tableId],
    );
  }

  async getById(tableId: string): Promise<Table> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.table WHERE table_id = $1",
      [tableId],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getAll(): Promise<Table[]> {
    return this.connection?.query("SELECT * FROM balduino.table", null);
  }

  async delete(tableId: string): Promise<void> {
    this.connection?.query("delete from balduino.table where table_id = $1", [
      tableId,
    ]);
  }
}
