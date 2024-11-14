import CreateResponseDto from "../../../infra/controllers/order/dto/CreateResponseDto";
import OrderDto from "../../../infra/controllers/order/dto/OrderDto";
import Order, { OrderStatus } from "../../../infra/domain/Order";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class CreateOrderUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(order: OrderDto): Promise<CreateResponseDto> {
    try {
      const orderEntity = new Order({
        customer_id: order.customer_id,
        table_id: order.table_id,
        created_by: order.created_by,
        products: order.products,
        status: OrderStatus.PENDING,
      });
      const response = await this.orderRepository?.save(orderEntity);
      return {
        order: response,
      };
    } catch (err: any) {
      return {
        order: undefined,
        errorMessage: err.message,
      };
    }
  }
}
