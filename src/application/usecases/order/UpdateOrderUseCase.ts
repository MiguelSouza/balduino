import OrderDto from "../../../infra/controllers/order/dto/OrderDto";
import Order from "../../../infra/domain/Order";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class UpdateOrderUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(order: OrderDto): Promise<void> {
    const oldOrder = await this.orderRepository?.getById(order.orderId);
    const newOrder = new Order(oldOrder as any);
    newOrder.update({
      customer_id: order.customer_id,
      products: order.products,
      status: order.status,
    });
    await this.orderRepository?.update(newOrder);
  }
}
