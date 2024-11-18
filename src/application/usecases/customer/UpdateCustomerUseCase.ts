import CustomerDto from "../../../infra/controllers/customer/dto/CustomerDto";
import Customer from "../../../infra/domain/Customer";
import CustomerRepository from "../../../infra/repositories/CustomerRepository";

export default class UpdateCustomerUseCase {
  customerRepository?: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customer: CustomerDto): Promise<void> {
    const oldCustomer = await this.customerRepository?.getCustomerById(
      customer.customerId,
    );
    const newCustomer = new Customer(oldCustomer as Customer);
    newCustomer.update({
      customer_id: customer.customerId,
      name: customer.name,
      phone: customer.phone ?? '',
      active: customer.active,
    });
    await this.customerRepository?.update(newCustomer);

    
    const updatedCustomerTables = customer.customerTables.map((table: any) => ({
      customer_id: customer.customerId,
      day: table.day,
      table: table.table
    }));
    await this.customerRepository?.removeCustomerTables(customer.customerId);
    
    await this.customerRepository?.saveCustomerTable(updatedCustomerTables);
  }
}
