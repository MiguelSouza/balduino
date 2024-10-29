import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class GetOrderByIdUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId: string) {
    return await this.orderRepository?.getById(orderId);
  }
}
