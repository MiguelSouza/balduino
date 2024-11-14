import CustomerRepository from "../../../infra/repositories/CustomerRepository";

export default class GetAllCustomerUseCase {
  customerRepository?: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(query: any) {
    return await this.customerRepository?.getAll(query);
  }
}
