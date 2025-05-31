import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class GetAllOrdersByCustomerUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(customerId: string) {
    return await this.orderRepository?.getAllOrdersByCustomer(customerId);
  }
}
