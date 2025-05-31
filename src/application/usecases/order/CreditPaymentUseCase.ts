import CreditPayment from "../../../infra/domain/CreditPayment";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class CreditPaymentUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(creditPayment: any): Promise<void> {
    const partialPaymentEntity = new CreditPayment({
      customer_destination_id: creditPayment.customerDestinationId,
      customer_origin_id: creditPayment.customerOriginId,
      value: creditPayment.value,
      payment_method: creditPayment.paymentMethod,
      customer_id: creditPayment.customerId,
      created_by: creditPayment.createdBy
    });
    await this.orderRepository?.payCredit(partialPaymentEntity);
  }
}
