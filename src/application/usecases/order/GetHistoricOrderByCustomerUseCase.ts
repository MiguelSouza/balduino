import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class GetHistoricOrderByCustomerUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(customerId: string) {
    return await this.orderRepository?.getHistoricOrderByCustomer(customerId);
  }
}
