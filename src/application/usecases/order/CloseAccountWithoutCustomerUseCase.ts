import Order from "../../../infra/domain/Order";
import OrderRepository from "../../../infra/repositories/OrderRepository";
import UserRepository from "../../../infra/repositories/UserRepository";

export default class CloseAccountWithoutCustomerUseCase {
  orderRepository?: OrderRepository;
  userRepository?: UserRepository;

  constructor(orderRepository: OrderRepository, userRepository: UserRepository) {
    this.orderRepository = orderRepository;
    this.userRepository = userRepository;
  }

  async execute(order: any): Promise<void> {
    const user: any = await this.userRepository?.getById(order.created_by || '');
    const orderEntity = new Order({
      created_by: user?.user_id ?? null,
      products: order.products,
      payment_method: order.paymentMethod,
    });
    await this.orderRepository?.closeAccountWithoutCustomer(orderEntity);
  }
}
