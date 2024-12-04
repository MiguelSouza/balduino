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
    //const user: any = await this.userRepository?.getByEmail(order.created_by || '');
    //console.log(user)
    const orderEntity = new Order({
      products: order.products,
      payment_method: order.paymentMethod,
    });
    await this.orderRepository?.closeAccountWithoutCustomer(orderEntity);
  }
}
