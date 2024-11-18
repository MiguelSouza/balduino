import ICustomerRepository from "../../application/repositories/CustomerRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Customer from "../domain/Customer";

export default class CustomerRepository implements ICustomerRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  async saveCustomerTable(customerTables: any): Promise<void> {
    for (const customerTable of customerTables) {
      await this.connection?.query(
        "INSERT INTO balduino.customer_table (customer_id, table_id, day_of_week) VALUES ($1, $2, $3)",
        [
          customerTable.customer_id || customerTable.customerId, 
          customerTable.table, 
          customerTable.day
        ]
      );
    }
  }

  async removeCustomerTables(customerId: string): Promise<void> {
    await this.connection?.query("DELETE FROM balduino.customer_table WHERE customer_id = $1", [customerId]);
  }

  async save(customer: Customer): Promise<Customer> {
    return this.connection?.query(
      "insert into balduino.customer (customer_id, name, phone, active, created_at, updated_at) values ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        customer.customerId,
        customer.name,
        customer.phone,
        customer.active,
        customer.createdAt,
        customer.updatedAt,
      ],
    );
  }

  async update(customer: Customer): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.customer 
            SET name = $1, phone = $2, active = $3, updated_at = $4
            WHERE customer_id = $5`,
      [
        customer.name,
        customer.phone,
        customer.active,
        new Date(),
        customer.customerId,
      ],
    );
  }

  async getByTable(tableId: string): Promise<Customer> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.customer WHERE table_id = $1",
      [tableId],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.customer WHERE customer_id = $1",
      [customerId],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getAll(query: any): Promise<Customer[]> {
    let sql = `
      SELECT c.customer_id, c.name, c.phone, c.active, c.created_at, c.updated_at,
       array_agg(
          json_build_object('table_id', t.table_id, 'table_name', t.name, 'day', ct.day_of_week)
        ) AS customerTables
      FROM balduino.customer c
      LEFT JOIN balduino.customer_table ct ON c.customer_id = ct.customer_id
      LEFT JOIN balduino.table t ON t.table_id = ct.table_id
    `;
    const params: string[] = [];
    let whereAdded = false;
    let paramIndex = 1;

    if (query.name) {
        sql += " WHERE LOWER(c.name) LIKE LOWER($" + paramIndex + ")";
        params.push(`%${query.name}%`);
        whereAdded = true;
        paramIndex++;
    }

    if (query.table_id) {
        if (whereAdded) {
            sql += " AND ct.table_id = $" + paramIndex;
        } else {
            sql += " WHERE ct.table_id = $" + paramIndex;
            whereAdded = true;
        }
        params.push(query.table_id);
        paramIndex++;
    }

    sql += " GROUP BY c.customer_id, c.name, c.phone, c.active, c.created_at, c.updated_at";

    const result = await this.connection?.query(sql, params);
    return result; 
  }


  async delete(customerId: string): Promise<void> {
    this.connection?.query(
      "delete from balduino.customer_table where customer_id = $1",
      [customerId],
    );
    this.connection?.query(
      "delete from balduino.customer where customer_id = $1",
      [customerId],
    );
  }
}
