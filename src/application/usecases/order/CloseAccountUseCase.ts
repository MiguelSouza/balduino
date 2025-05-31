import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class CloseAccountUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(customerId: string, paymentMethod: string, discount: number): Promise<void> {
    await this.orderRepository?.closeAccount(customerId, paymentMethod, discount);
  }
}
