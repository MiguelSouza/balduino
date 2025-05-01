import CreateResponseDto from "../../../infra/controllers/order/dto/CreateResponseDto";
import OrderDto from "../../../infra/controllers/order/dto/OrderDto";
import Order, { OrderStatus } from "../../../infra/domain/Order";
import OrderRepository from "../../../infra/repositories/OrderRepository";
import UserRepository from "../../../infra/repositories/UserRepository";

export default class CreateOrderUseCase {
  orderRepository?: OrderRepository;
  userRepository?: UserRepository;

  constructor(orderRepository: OrderRepository, userRepository: UserRepository) {
    this.orderRepository = orderRepository;
    this.userRepository = userRepository;
  }

  async execute(order: OrderDto): Promise<CreateResponseDto> {
    try {
      
      const user: any = await this.userRepository?.getById(order.created_by || '');
      const orderEntity = new Order({
        customer_id: order.customer_id,
        table_id: order.table_id,
        created_by: user?.user_id ?? null,
        products: order.products,
        status: order.status ?? OrderStatus.PENDING,
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
