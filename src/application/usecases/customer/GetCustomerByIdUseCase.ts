import CustomerRepository from "../../../infra/repositories/CustomerRepository";

export default class GetCustomerByIdUseCase {
  customerRepository?: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId: string) {
    return await this.customerRepository?.getCustomerById(customerId);
  }
}
