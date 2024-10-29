import IOrderRepository from "../../application/repositories/OrderRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Order from "../domain/Order";
import { v4 as uuid } from "uuid";

export default class OrderRepository implements IOrderRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  getByCustomer(customerId: string): Promise<Order> {
    throw new Error("Method not implemented.");
  }
  getByTable(tableId: string): Promise<Order> {
    throw new Error("Method not implemented.");
  }

  async save(order: Order): Promise<Order> {
    const result = await this.connection?.query(
      `INSERT INTO balduino.order (order_id, table_id, customer_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        order.orderId,
        order.tableId,
        order.customerId,
        order.status || null,
        order.createdAt,
        order.updatedAt,
      ],
    );

    await this.saveOrderProducts(order.orderId, order.products);
    return result;
  }

  private async saveOrderProducts(
    orderId: string,
    products: Array<{ productId: string; quantity: number }>,
  ) {
    for (const product of products) {
      await this.connection?.query(
        `INSERT INTO balduino.order_product (order_product_id, order_id, product_id, quantity)
         VALUES ($1, $2, $3, $4)`,
        [uuid(), orderId, product.productId, product.quantity],
      );
    }
  }

  async update(order: Order): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.order 
       SET table_id = $1, customer_id = $2, status = $3, updated_at = $4
       WHERE order_id = $5`,
      [
        order.tableId,
        order.customerId,
        order.status || null,
        new Date(),
        order.orderId,
      ],
    );

    await this.updateOrderProducts(order.orderId, order.products);
  }

  private async updateOrderProducts(
    orderId: string,
    products: Array<{ productId: string; quantity: number }>,
  ) {
    const currentProducts = await this.getOrderProducts(orderId);

    const currentProductIds = currentProducts.map(
      (product) => product.productId,
    );

    for (const product of products) {
      const existingProductIndex = currentProductIds.indexOf(product.productId);
      if (existingProductIndex >= 0) {
        await this.connection?.query(
          `UPDATE balduino.order_product 
                 SET quantity = $1 
                 WHERE order_id = $2 AND product_id = $3`,
          [product.quantity, orderId, product.productId],
        );
      } else {
        await this.connection?.query(
          `INSERT INTO balduino.order_product (order_product_id, order_id, product_id, quantity)
                 VALUES ($1, $2, $3, $4)`,
          [uuid(), orderId, product.productId, product.quantity],
        );
      }
    }

    for (const currentProduct of currentProducts) {
      if (
        !products.some(
          (product) => product.productId === currentProduct.productId,
        )
      ) {
        await this.connection?.query(
          `DELETE FROM balduino.order_product 
                 WHERE order_id = $1 AND product_id = $2`,
          [orderId, currentProduct.productId],
        );
      }
    }
  }

  async getById(orderId: string): Promise<Order> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.order WHERE order_id = $1",
      [orderId],
    );

    const products = await this.getOrderProducts(orderId);

    return {
      ...result[0],
      products,
    } as Order;
  }

  private async getOrderProducts(
    orderId: string,
  ): Promise<Array<{ productId: string; quantity: number }>> {
    return this.connection?.query(
      "SELECT product_id, quantity FROM balduino.order_product WHERE order_id = $1",
      [orderId],
    );
  }

  async getAll(): Promise<Order[]> {
    return this.connection?.query("SELECT * FROM balduino.order", null);
  }

  async delete(orderId: string): Promise<void> {
    await this.connection?.query(
      "DELETE FROM balduino.order_product WHERE order_id = $1",
      [orderId],
    );
    await this.connection?.query(
      "DELETE FROM balduino.order WHERE order_id = $1",
      [orderId],
    );
  }

  async getByCustomerId(customerId: string): Promise<Order[]> {
    return this.connection?.query(
      "SELECT * FROM balduino.order WHERE customer_id = $1",
      [customerId],
    );
  }

  async getByTableId(tableId: string): Promise<Order[]> {
    return this.connection?.query(
      "SELECT * FROM balduino.order WHERE table_id = $1",
      [tableId],
    );
  }
}
