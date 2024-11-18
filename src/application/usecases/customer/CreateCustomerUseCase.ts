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
        name: customer.name,
        phone: customer.phone,
        active: customer.active,
      });

      const response: any = await this.customerRepository?.save(customerEntity);
      
      const updatedCustomerTables = customer.customerTables.map((table: any) => ({
        customer_id: response[0].customer_id,
        day: table.day,
        table: table.table
      }));

      await this.customerRepository?.saveCustomerTable(updatedCustomerTables);
      
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
