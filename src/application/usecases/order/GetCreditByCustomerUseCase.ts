import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class GetCreditByCustomerUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(customerId: string) {
    return await this.orderRepository?.getCreditByCustomer(customerId);
  }
}
