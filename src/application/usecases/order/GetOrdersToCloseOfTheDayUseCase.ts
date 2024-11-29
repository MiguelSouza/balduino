import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class GetOrdersToCloseOfTheDayUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(filters: any) {
    return await this.orderRepository?.getOrdersToClosing(filters);
  }
}
