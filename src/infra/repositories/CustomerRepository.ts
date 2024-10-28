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
      "insert into balduino.customer (customer_id, table_id, name, cpf, birthday, active, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        customer.customerId,
        customer.tableId,
        customer.name,
        customer.cpf,
        customer.birthday,
        customer.active,
        customer.createdAt,
        customer.updatedAt,
      ],
    );
  }

  async update(customer: Customer): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.customer 
            SET name = $1, table_id = $2, birthday = $3, active = $4, updated_at = $5 
            WHERE customer_id = $6`,
      [
        customer.name,
        customer.tableId,
        customer.birthday,
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

  async getAll(): Promise<Customer[]> {
    return this.connection?.query("SELECT * FROM balduino.customer", null);
  }

  async delete(customerId: string): Promise<void> {
    this.connection?.query("delete from balduino.customer where customer_id = $1", [
      customerId,
    ]);
  }
}
