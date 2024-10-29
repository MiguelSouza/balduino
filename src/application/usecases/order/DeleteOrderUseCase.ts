import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class DeleteOrderUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId: string) {
    this.orderRepository?.delete(orderId);
  }
}
