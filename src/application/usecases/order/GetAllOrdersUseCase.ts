import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class GetAllOrdersUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(filters: any) {
    return await this.orderRepository?.getAll(filters);
  }
}
