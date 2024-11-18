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
      `INSERT INTO balduino.order (order_id, customer_id, table_id, status, created_at, updated_at,created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        order.orderId,
        order.customerId,
        order.tableId,
        order.status || null,
        order.createdAt,
        order.updatedAt,
        order.createdBy
      ],
    );

    await this.saveOrderProducts(order.orderId, order.products);
    return result;
  }

  private async saveOrderProducts(
    orderId: string,
    products: Array<{ productId: string; quantity: number, price: number }>,
  ) {
    for (const product of products) {
      await this.connection?.query(
        `INSERT INTO balduino.order_product (order_product_id, order_id, product_id, quantity, price, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuid(),
          orderId,
          product.productId,
          product.quantity,
          product.price,
          new Date(),
          null,
        ],
      );
    }
  }

  async update(order: Order): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.order 
       SET customer_id = $1, status = $2, updated_at = $3
       WHERE order_id = $4`,
      [order.customerId, order.status || null, new Date(), order.orderId],
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
      "SELECT product_id, quantity, price FROM balduino.order_product WHERE order_id = $1",
      [orderId],
    );
  }

  async getAll(filters: any): Promise<any[]> {
    const { status, customer_name, table, date } = filters;

    let query = `
      SELECT 
        o.order_id, 
        o.order_number,
        c.name as customer_name, 
        o.status, 
        p.product_id, 
        p.name AS product_name, 
        op.quantity,
        t.name as table_name,
        u.name as delivered_by
      FROM balduino.order o 
      JOIN balduino.order_product op ON o.order_id = op.order_id
      JOIN balduino.customer c ON c.customer_id = o.customer_id
      JOIN balduino.table t ON t.table_id = o.table_id
      JOIN balduino.product p ON p.product_id = op.product_id
      JOIN balduino.user u ON u.user_id = o.created_by
      WHERE c.active = true
    `;

    if (status) {
      const statusArray = status.split(',').map((s: any) => s.trim()); 
      const statusList = statusArray.map((s: any) => `'${s}'`).join(', ');
      query += ` AND o.status in (${statusList})`;
    } else {
      query += ` AND o.status != 'paid' AND o.status != 'canceled'`;
    }
  
    if (customer_name) {
      query += ` AND c.name LIKE '%${customer_name}%'`;
    }
  
    if (table) {
      query += ` AND t.name LIKE '%${table}%'`;
    }
  
    if (date) {
      const dateFormat = new Date(date)
      const formattedDate = dateFormat.toISOString().split('T')[0];
      query += ` AND o.created_at = '${formattedDate}'`;
    } else {
      query += ` AND o.created_at >= CURRENT_DATE`;
    }
  
    query += `
      ORDER BY 
      CASE 
        WHEN o.status = 'delivered' THEN 1
        ELSE 0
      END,
      o.order_id DESC;
    `;
    
    const result = await this.connection?.query(query, null);
    
    const ordersMap = new Map<string, any>();
    
    result?.forEach((row: any) => {
      if (ordersMap.has(row.order_id)) {
        const order = ordersMap.get(row.order_id)!;
        order.products.push({
          productId: row.product_id,
          name: row.product_name,
          quantity: row.quantity,
        });
      } else {
        ordersMap.set(row.order_id, {
          order_id: row.order_id,
          delivered_by: row.delivered_by,
          orderNumber: row.order_number,
          customerName: row.customer_name,
          status: row.status,
          tableName: row.table_name,
          products: [
            {
              productId: row.product_id,
              name: row.product_name,
              quantity: row.quantity,
            },
          ],
        });
      }
    });
  
    return Array.from(ordersMap.values());
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

  async getAllOrdersByCustomer(customerId: string): Promise<any> {
    const result = await this.connection?.query(`
      SELECT 
        o.order_id, 
        o.order_number,
        c.name as customer_name,
        c.customer_id as customer_id, 
        o.status, 
        p.product_id, 
        p.name AS product_name, 
        p.value AS product_value, 
        op.quantity,
        op.price,
        t.name as table_name
      FROM balduino.order o 
      JOIN balduino.order_product op ON o.order_id = op.order_id
      JOIN balduino.customer c ON c.customer_id = o.customer_id
      JOIN balduino.table t ON t.table_id = o.table_id
      JOIN balduino.product p ON p.product_id = op.product_id
      WHERE c.customer_id = $1 and status = $2
      ORDER BY o.order_number;
    `, [customerId, 'delivered']);
    
    const customersOrdersList: { customerId: string, customerName: string, orders: any[], totalAmount: number }[] = [];
    
    result?.forEach((row: any) => {
      const customerName = row.customer_name;
      const customerId = row.customer_id;
    
      let customer = customersOrdersList.find(item => item.customerName === customerName);
      
      if (!customer) {
        customer = {
          customerName: customerName,
          customerId: customerId,
          orders: [],
          totalAmount: 0,
        };
        customersOrdersList.push(customer);
      }
    
      const orderIndex = customer.orders.findIndex((order: any) => order.order_id === row.order_id);
    
      if (orderIndex === -1) {
        const totalOrderValue = row.price * row.quantity;
    
        customer.orders.push({
          order_id: row.order_id,
          orderNumber: row.order_number,
          status: row.status,
          tableName: row.table_name,
          products: [{
            productId: row.product_id,
            name: row.product_name,
            quantity: row.quantity,
            value: row.price
          }],
          totalValue: totalOrderValue, 
        });
    
        customer.totalAmount += totalOrderValue;
      } else {
        const totalProductValue = row.product_value * row.quantity;
    
        customer.orders[orderIndex].products.push({
          productId: row.product_id,
          name: row.product_name,
          quantity: row.quantity,
          value: row.price
        });
    
        customer.orders[orderIndex].totalValue += totalProductValue;
    
        customer.totalAmount += totalProductValue;
      }
    });
    
    return customersOrdersList;
       
  }

  async closeAccount(customerId: string, paymentMethod: string){
    await this.connection?.query(
      `UPDATE balduino.order 
       SET status = $1, updated_at = $2, payment_method = $3
       WHERE customer_id = $4 and status = $5`,
      ['paid', new Date(), paymentMethod, customerId, 'delivered'],
    );
  }
}
