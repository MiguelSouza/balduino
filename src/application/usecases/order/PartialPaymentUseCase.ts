import PartialPayment from "../../../infra/domain/PartialPayment";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class PartialPaymentUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(partialPayment: any): Promise<void> {
    const partialPaymentEntity = new PartialPayment({
      payment_method: partialPayment.paymentMethod,
      value: partialPayment.value,
      order_id: partialPayment.orderId,
      payment_date: new Date(),
    });
    await this.orderRepository?.payPartial(partialPaymentEntity);
  }
}
