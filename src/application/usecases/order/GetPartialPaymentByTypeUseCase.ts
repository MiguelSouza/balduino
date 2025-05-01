import PartialPayment from "../../../infra/domain/PartialPayment";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class GetPartialPaymentByTypeUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(type: string): Promise<PartialPayment | null> {
    const result = await this.orderRepository?.getPartialPaymentByType(type);
    return result ?? null;
  }
}
