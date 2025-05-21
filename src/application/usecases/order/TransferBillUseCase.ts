import PartialPayment from "../../../infra/domain/PartialPayment";
import TransferBill from "../../../infra/domain/TransferBill";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class TransferBillUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(transferBill: TransferBill): Promise<void> {
    const transferBillEntity = new TransferBill({
      transferDate: new Date(),
      value: transferBill.value,
      status: transferBill.status || 'pending',
      toCustomerId: transferBill.toCustomerId,
      fromCustomerId: transferBill.fromCustomerId,
    });
   // await this.orderRepository?.transferBill(transferBillEntity);
  }
}
