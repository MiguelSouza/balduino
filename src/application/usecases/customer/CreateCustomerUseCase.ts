import CreateResponseDto from "../../../infra/controllers/customer/dto/CreateResponseDto";
import CustomerDto from "../../../infra/controllers/customer/dto/CustomerDto";
import Customer from "../../../infra/domain/Customer";
import CustomerRepository from "../../../infra/repositories/CustomerRepository";

export default class CreateCustomerUseCase {
  customerRepository?: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customer: CustomerDto): Promise<CreateResponseDto> {
    try {
      const customerEntity = new Customer({
        tableId: customer.table_id,
        name: customer.name,
        active: customer.active,
        birthday: customer.birthday,
        cpf: customer.cpf,
      });
      const response = await this.customerRepository?.save(customerEntity);
      return {
        customer: response,
      };
    } catch (err: any) {
      return {
        customer: undefined,
        errorMessage: err.message,
      };
    }
  }
}
