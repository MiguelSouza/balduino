import { ParameterizedQuery } from "pg-promise";
import IOrderRepository from "../../application/repositories/OrderRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Order from "../domain/Order";
import { v4 as uuid } from "uuid";
import PartialPayment from "../domain/PartialPayment";

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
        order.createdAt.toISOString(),
        order.updatedAt?.toISOString(),
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
    const dateFormat = new Date(date);
    const formattedDate = dateFormat.toISOString().split('T')[0] + ' ' + dateFormat.toTimeString().split(' ')[0];

    query += `
      AND (
        (EXTRACT(HOUR FROM o.updated_at) >= 10 AND o.updated_at::date = '${formattedDate}'::date)
        OR
        (EXTRACT(HOUR FROM o.updated_at) < 9 AND o.updated_at::date = ('${formattedDate}'::date + INTERVAL '1 day')::date)
      )`;
  } else {
    const now = new Date();
    const currentHour = now.getHours();

    let startDate, endDate;

    // Se antes das 10h, começa às 10h de ontem até as 6h de hoje
    if (currentHour < 10) {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1); // Dia anterior
      startDate.setHours(10, 0, 0, 0); // Início às 10h do dia anterior

      endDate = new Date(now);
      endDate.setHours(6, 0, 0, 0); // Fim às 6h de hoje

    } else {
      // Se já passou das 10h, começa às 10h de hoje até as 6h de amanhã
      startDate = new Date(now);
      startDate.setHours(10, 0, 0, 0); // Início às 10h de hoje

      endDate = new Date(now);
      endDate.setDate(now.getDate() + 1); // Dia seguinte
      endDate.setHours(6, 0, 0, 0); // Fim às 6h de amanhã
    }

    // Formatação das datas no formato YYYY-MM-DD HH:mm:ss
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    query += `
      AND o.updated_at >= '${formattedStartDate}'::timestamp
      AND o.updated_at < '${formattedEndDate}'::timestamp
    `;
  }

  query += `
    ORDER BY 
    CASE 
        WHEN o.status = 'pending' THEN 1
        ELSE 0
    END DESC,  -- 'pending' vai aparecer primeiro
    o.order_number DESC; 
  `;

  console.log(query);

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
        c.name AS customer_name,
        c.customer_id AS customer_id, 
        t.table_id AS table_id, 
        o.status, 
        p.product_id, 
        p.name AS product_name, 
        p.value AS product_value, 
        op.quantity,
        op.price,
        t.name AS table_name,
        -- Soma dos pagamentos parciais
        COALESCE((SELECT SUM(pp.value) FROM balduino.partial_payment pp WHERE pp.order_id = o.order_id), 0) AS total_partial_payment  
      FROM balduino.order o 
      JOIN balduino.order_product op ON o.order_id = op.order_id
      JOIN balduino.customer c ON c.customer_id = o.customer_id
      JOIN balduino.table t ON t.table_id = o.table_id
      JOIN balduino.product p ON p.product_id = op.product_id
      WHERE c.customer_id = $1 AND o.status = $2
      ORDER BY o.order_number, p.product_id;
    `, [customerId, 'delivered']);

    const customersOrdersList: { customerId: string, tableId: string, customerName: string, orders: any[], totalAmount: number }[] = [];
    
    result?.forEach((row: any) => {
      const customerName = row.customer_name;
      const customerId = row.customer_id;
    
      let customer = customersOrdersList.find(item => item.customerName === customerName);
    
      if (!customer) {
        customer = {
          customerName: customerName,
          customerId: customerId,
          tableId: row.table_id,
          orders: [],
          totalAmount: 0,
        };
        customersOrdersList.push(customer);
      }
    
      const orderIndex = customer.orders.findIndex((order: any) => order.order_id === row.order_id);
    
      const totalProductValue = row.price * row.quantity;
      const totalPartialPayment = parseFloat(row.total_partial_payment);
    
      if (orderIndex === -1) {
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
          totalValue: totalProductValue - totalPartialPayment,
          partialPaymentApplied: totalPartialPayment > 0 ? totalPartialPayment : 0,
        });
    
        customer.totalAmount += (totalProductValue - totalPartialPayment);
      } else {
        customer.orders[orderIndex].products.push({
          productId: row.product_id,
          name: row.product_name,
          quantity: row.quantity,
          value: row.price
        });
    
        if (customer.orders[orderIndex].partialPaymentApplied === 0 && totalPartialPayment > 0) {
          customer.orders[orderIndex].totalValue += totalProductValue - totalPartialPayment;
          customer.totalAmount += (totalProductValue - totalPartialPayment);
          customer.orders[orderIndex].partialPaymentApplied = totalPartialPayment;
        } else {
          customer.orders[orderIndex].totalValue += totalProductValue;
          customer.totalAmount += totalProductValue;
        }
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

  async closeAccountWithoutCustomer(order: Order){
    const result = await this.connection?.query(
      `INSERT INTO balduino.order (order_id, status, payment_method, created_at, updated_at,created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        order.orderId,
        'paid',
        order.paymentMethod,
        order.createdAt.toISOString(),
        order.updatedAt?.toISOString(),
        "18eb3400-ac43-4a04-a562-1ff4c6d542c5"
      ],
    );

    await this.saveOrderProducts(order.orderId, order.products);
    return result;
  }

  
  async getOrdersToClosing(filters: any): Promise<any> {
    const dateParam = filters.date ? new Date(filters.date) : new Date();
    const formattedDate = dateParam.toISOString().split('T')[0];

    let queryParams: any[];
    console.log(dateParam)

    if (filters.period === 'daily') {
        queryParams = [formattedDate];
    } else if (filters.period === 'monthly') {
      let startOfMonth;

      if (dateParam.getDate() === new Date(dateParam.getFullYear(), dateParam.getMonth() + 1, 0).getDate()) {
          startOfMonth = new Date(dateParam.getFullYear(), dateParam.getMonth() + 1, 1);
      } else {
          startOfMonth = new Date(dateParam.getFullYear(), dateParam.getMonth(), 1);
      }
      const formattedStartOfMonth = startOfMonth.toISOString().split('T')[0];
      queryParams = [formattedStartOfMonth];
    } else {
        throw new Error('Invalid period filter');
    }

    const result = await this.connection?.query(
      `
      SELECT
          payment_method,
          SUM(total_faturado) AS total_faturado
      FROM (
          SELECT 
              o.payment_method,                          
              SUM(op.quantity * op.price) AS total_faturado
          FROM 
              balduino."order" o                                    
          JOIN 
              balduino.order_product op ON o.order_id = op.order_id
          WHERE 
              o.status = 'paid'   
              ${filters.period === 'monthly' ? 
                  ` AND (
                      o.updated_at >= date_trunc('month', $1::date) + INTERVAL '10 hours'
                      AND o.updated_at < date_trunc('month', $1::date + INTERVAL '1 month')
                  )` : 
                  `AND (
                      -- Para o período diário, verifica a hora e a data
                      (EXTRACT(HOUR FROM o.updated_at) >= 10 AND o.updated_at::date = $1::date)
                      OR
                      (EXTRACT(HOUR FROM o.updated_at) < 9 AND o.updated_at::date = ($1::date + INTERVAL '1 day')::date)
                  )`}
          GROUP BY 
              o.payment_method
        
          UNION ALL
        
          -- Consulta para a tabela "partial_payment"
          SELECT
              pp.payment_method,
              SUM(pp.value) AS total_faturado
          FROM
              balduino.partial_payment pp
          JOIN
              balduino."order" o ON o.order_id = pp.order_id
          WHERE
              pp.payment_date >= $1::date + INTERVAL '7 hours'  -- Início às 7 da manhã do dia fornecido
              AND pp.payment_date < $1::date + INTERVAL '1 day' + INTERVAL '6 hours'  -- Fim às 6 da manhã do dia seguinte
             
          GROUP BY
              pp.payment_method
    
      ) AS combined_results
      GROUP BY 
          payment_method
      ORDER BY 
          total_faturado DESC;
      `,
      queryParams
    );
    
    const resultPayment = await this.connection?.query(
      `
       SELECT
            SUM(p.value) AS total_payments
        FROM
            balduino.payments p
        WHERE
            p.payment_date >= date_trunc('month', $1::date) + INTERVAL '10 hours'
            AND p.payment_date < date_trunc('month', $1::date + INTERVAL '1 month')
            AND p.status = 'paid'
      `,
      queryParams
    );
    const resultExpense = await this.connection?.query(
      `
      SELECT
            SUM(e.value) AS total_expenses
        FROM
            balduino.expense e
        WHERE
            e.created_at >= date_trunc('month', $1::date) + INTERVAL '10 hours'
            AND e.created_at < date_trunc('month', $1::date + INTERVAL '1 month')
      `,
      queryParams
    );

    const totalFaturado = result.reduce((total: any, current:any) => {
      return total + current.total_faturado;
    }, 0);

    result.push({
      payment_method: null,
      total_faturado: totalFaturado
    })

    return {
      data: result,
      resume: {
        total_payments: resultPayment.length ? resultPayment[0].total_payments : 0,
        total_expenses: resultExpense.length ? resultExpense[0].total_expenses : 0,
      }
    };
  }



  async payPartial(partialPayment: PartialPayment): Promise<PartialPayment> {
    const result = await this.connection?.query(
      `INSERT INTO balduino.partial_payment 
        (partial_payment_id, order_id, payment_method, payment_date, value, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        partialPayment.partialPaymentId,
        partialPayment.orderId,
        partialPayment.paymentMethod,
        partialPayment.paymentDate,
        partialPayment.value,
        partialPayment.createdAt.toISOString(),
        partialPayment.updatedAt?.toISOString()
      ]
    );
    
    return result;
  }


  
}
