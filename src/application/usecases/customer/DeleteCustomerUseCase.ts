import CustomerRepository from "../../../infra/repositories/CustomerRepository";

export default class DeleteCustomerUseCase {
  customerRepository?: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId: string) {
    this.customerRepository?.delete(customerId);
  }
}
