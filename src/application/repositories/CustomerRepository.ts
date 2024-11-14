import Customer from "../../infra/domain/Customer";

export default interface ICustomerRepository {
  save(customer: Customer): Promise<Customer>;
  update(customer: Customer): void;
  getCustomerById(customerId: string): Promise<Customer>;
  getAll(query: any): Promise<Customer[]>;
  delete(customerId: string): void;
  getByTable(tableId: string): Promise<Customer>;
}
