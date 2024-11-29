import OrderDto from "../../../infra/controllers/order/dto/OrderDto";
import Order from "../../../infra/domain/Order";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class CloseAccountWithoutCustomerUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(order: any): Promise<void> {
    const orderEntity = new Order({
      created_by: order.created_by,
      products: order.products,
      payment_method: order.paymentMethod,
    });
    await this.orderRepository?.closeAccountWithoutCustomer(orderEntity);
  }
}
