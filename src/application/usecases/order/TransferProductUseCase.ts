
import TransferProduct from "../../../infra/domain/TransferProduct";
import OrderRepository from "../../../infra/repositories/OrderRepository";

export default class TransferProductUseCase {
  orderRepository?: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(transferProduct: TransferProduct): Promise<any> {
    const transferProductEntity = new TransferProduct({
      orderId: transferProduct.orderId,
      productId: transferProduct.productId,
      quantity: transferProduct.quantity,
      toCustomerId: transferProduct.toCustomerId,
      fromCustomerId: transferProduct.fromCustomerId,
      status: transferProduct.status,
      tableId: transferProduct.tableId,
      createdBy: transferProduct.createdBy
    });
    return await this.orderRepository?.transferProduct(transferProductEntity);
  }
}
