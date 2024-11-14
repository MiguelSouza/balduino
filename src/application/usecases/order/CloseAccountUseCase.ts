import OrderDto from "../../../infra/controllers/order/dto/OrderDto";
import Order from "../../../infra/domain/Order";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class CloseAccountUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(customerId: string, paymentMethod: string): Promise<void> {
    await this.orderRepository?.closeAccount(customerId, paymentMethod);
  }
}
