import Order from "../../infra/domain/Order";

export default interface IOrderRepository {
  save(order: Order): Promise<Order>;
  update(order: Order): void;
  getById(orderId: string): Promise<Order>;
  getAll(): Promise<Order[]>;
  delete(orderId: string): void;
  getByCustomer(customerId: string): Promise<Order>;
}
