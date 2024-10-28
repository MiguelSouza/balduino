import CustomerDto from "../../../infra/controllers/customer/dto/CustomerDto";
import Customer from "../../../infra/domain/Customer";
import CustomerRepository from "../../../infra/repositories/CustomerRepository";

export default class UpdateCustomerUseCase {
  customerRepository?: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customer: CustomerDto): Promise<void> {
    const oldCustomer = await this.customerRepository?.getCustomerById(customer.customerId);
    const newCustomer = new Customer(oldCustomer as Customer);
    newCustomer.update({
      name: customer.name,
      tableId: customer.table_id,
      active: customer.active,
      birthday: customer.birthday,
      cpf: customer.cpf,
    });
    await this.customerRepository?.update(newCustomer);
  }
}
