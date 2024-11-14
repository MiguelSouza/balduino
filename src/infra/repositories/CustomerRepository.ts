import ICustomerRepository from "../../application/repositories/CustomerRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Customer from "../domain/Customer";

export default class CustomerRepository implements ICustomerRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
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
    let sql = "SELECT * FROM balduino.customer";
    const params: string[] = [];
    let whereAdded = false;

    if (query.name) {
        sql += " WHERE LOWER(name) LIKE LOWER($1)";
        params.push(`%${query.name}%`);
        whereAdded = true;
    }

    return this.connection?.query(sql, params);
  }


  async delete(customerId: string): Promise<void> {
    this.connection?.query(
      "delete from balduino.customer where customer_id = $1",
      [customerId],
    );
  }
}
