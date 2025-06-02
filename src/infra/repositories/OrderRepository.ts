import IOrderRepository from "../../application/repositories/OrderRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Order, { OrderStatus } from "../domain/Order";
import { v4 as uuid } from "uuid";
import PartialPayment from "../domain/PartialPayment";
import CreditPayment from "../domain/CreditPayment";
import CreditPaymentUsage from "../domain/CreditPaymentUsage";
import TransferProduct from "../domain/TransferProduct";
import TransferProductHistory from "../domain/TransferProductHistory";

export default class OrderRepository implements IOrderRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection,

  ) {
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
      `INSERT INTO balduino.order (order_id, customer_id, table_id, status, created_at, updated_at,created_by, credit_origin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        order.orderId,
        order.customerId,
        order.tableId,
        order.status || null,
        order.createdAt.toISOString(),
        order.updatedAt?.toISOString(),
        order.createdBy,
        order.creditOrigin
      ],
    );

    await this.saveOrderProducts(order.orderId, order.products);

    return result[0];
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
  
  async payCreditOrder(creditPaymentUsage: CreditPaymentUsage): Promise<void> {
    const orders = await this.getAllOrdersByCustomer(creditPaymentUsage.customerId || '');
    
    const deliveredOrders = orders.orders[0].orders
      .filter((order: any) => order.status === 'delivered')
      .sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const result = await this.connection?.query(`
      SELECT
        COALESCE(cp_total, 0) - COALESCE(cu_total, 0) AS total
      FROM (
        SELECT SUM(value) AS cp_total
        FROM balduino.credit_payment
        WHERE customer_destination_id = $1
      ) cp,
      (
        SELECT SUM(value) AS cu_total
        FROM balduino.customer_credit_usage
        WHERE customer_id = $1
      ) cu
    `, [creditPaymentUsage.customerId]);
  
    let availableCredit = result?.[0]?.total || 0;
    if (availableCredit <= 0) {
      console.log('Nenhum crédito disponível.');
      return;
    }
  
    const usageId = creditPaymentUsage.creditPaymentUsageId;

    // ⚠️ Primeiro, insere o registro PAI (mesmo que com valor 0)
    await this.connection?.query(`
      INSERT INTO balduino.customer_credit_usage (
        usage_id, customer_id, value, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      usageId,
      creditPaymentUsage.customerId,
      0, // será atualizado depois com o valor real
      creditPaymentUsage.createdAt.toISOString(),
      creditPaymentUsage.updatedAt?.toISOString(),
    ]);

    let appliedCredit = 0;

    for (const order of deliveredOrders) {
      const total = order.totalValue;
      if (availableCredit <= 0) break;

      const valueToApply = Math.min(total, availableCredit);

      await this.connection?.query(`
        INSERT INTO balduino.customer_credit_usage_orders (
          usage_order_id, usage_id, order_id, value
        ) VALUES (gen_random_uuid(), $1, $2, $3)
      `, [
        usageId,
        order.order_id,
        valueToApply
      ]);

      appliedCredit += valueToApply;
      availableCredit -= valueToApply;
    }

    // ⚠️ Atualiza o valor real usado
    if (appliedCredit > 0) {
      await this.connection?.query(`
        UPDATE balduino.customer_credit_usage
        SET value = $1, updated_at = $2
        WHERE usage_id = $3
      `, [
        appliedCredit,
        creditPaymentUsage.updatedAt?.toISOString(),
        usageId
      ]);
    }

  
    console.log('Créditos aplicados com sucesso.');
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
  ): Promise<Array<{ productId: string; quantity: number, price: number }>> {
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
      o.created_at,
      c.name as customer_name, 
      o.status, 
      p.product_id, 
      p.name AS product_name, 
      op.quantity,
      t.table_id as table_id,
      t.name as table_name,
      u.name as delivered_by
    FROM balduino.order o 
    JOIN balduino.order_product op ON o.order_id = op.order_id
    JOIN balduino.customer c ON c.customer_id = o.customer_id
    JOIN balduino.table t ON t.table_id = o.table_id
    JOIN balduino.product p ON p.product_id = op.product_id
    JOIN balduino.user u ON u.user_id = o.created_by
    WHERE c.active = true and p.type = 'common'
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
      endDate.setHours(10, 0, 0, 0); // Fim às 6h de hoje

    } else {
      // Se já passou das 10h, começa às 10h de hoje até as 6h de amanhã
      startDate = new Date(now);
      startDate.setHours(10, 0, 0, 0); // Início às 10h de hoje

      endDate = new Date(now);
      endDate.setDate(now.getDate() + 1); // Dia seguinte
      endDate.setHours(10, 0, 0, 0);
    }

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
        createdAt: row.created_at,
        delivered_by: row.delivered_by,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        status: row.status,
        tableName: row.table_name,
        tableId: row.table_id,
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
        o.created_at,
        o.created_by,
        c.name AS customer_name,
        c.customer_id AS customer_id, 
        t.table_id AS table_id, 
        o.status, 
        o.credit_origin, 
        p.product_id, 
        p.name AS product_name, 
        p.value AS product_value, 
        p.type, 
        op.quantity,
        op.price,
        t.name AS table_name,
    
        -- Pagamentos parciais
        COALESCE(pp.total_partial_payment, 0) AS total_partial_payment,
        pp.payments,
    
        -- Transferências recebidas
        COALESCE(tp.transfer_products, '[]') AS transfer_products
    
      FROM balduino.order o 
      JOIN balduino.order_product op ON o.order_id = op.order_id
      JOIN balduino.customer c ON c.customer_id = o.customer_id
      JOIN balduino.table t ON t.table_id = o.table_id
      JOIN balduino.product p ON p.product_id = op.product_id
    
      -- Pagamentos parciais agregados
      LEFT JOIN (
        SELECT 
            order_id,
            SUM(value) AS total_partial_payment,
            json_agg(
                json_build_object(
                    'payment_date', payment_date,
                    'payment_method', payment_method,
                    'value', value
                )
            ) AS payments
        FROM balduino.partial_payment
        GROUP BY order_id
      ) pp ON pp.order_id = o.order_id
    
      -- Transferências recebidas agregadas por produto/pedido
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'order_transfer_history_id', oth.order_transfer_history_id,
            'from_customer_id', cf.customer_id,
            'from_customer_name', cf.name,
            'quantity_transferred', oth.quantity_transferred,
            'product_name', p.name,
            'created_at', oth.created_at,
            'created_at', oth.created_at,
            'price', op_from.price
          )
        ) AS transfer_products
        FROM balduino.order_transfer_history oth
        JOIN balduino.customer cf ON cf.customer_id = oth.from_customer_id
        JOIN balduino.order_product op_from ON op_from.order_id = oth.from_order_id AND op_from.product_id = oth.product_id
        WHERE oth.to_order_id = o.order_id AND oth.product_id = p.product_id
      ) tp ON true
    
      WHERE c.customer_id = $1 
        AND o.status = $2 
        AND op.quantity > 0
    
      ORDER BY o.order_number, p.product_id;
    `, [customerId, 'delivered']);

    const customersOrdersList: { customerId: string, tableId: string, customerName: string, orders: any[], totalAmount: number }[] = [];
    let payments:any = [];
    let transferProducts: any = [];
    result?.forEach((row: any) => {
      const customerName = row.customer_name;
      const customerId = row.customer_id;
      
      if(row.transfer_products && row.order_id){
        transferProducts.push(...row.transfer_products);
      }

      if(row.payments && row.order_id){
        payments.push(...row.payments);
      }

      
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
          createdAt: row.created_at,
          createdBy: row.created_by,
          status: row.status,
          tableName: row.table_name,
          tableId: row.table_id,
          products: [{
            productId: row.product_id,
            name: row.product_name,
            quantity: row.quantity,
            value: row.price,
            type: row.type,
            creditOrigin: row.credit_origin
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
          value: row.price,
          type: row.type,
          creditOrigin: row.credit_origin
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
    
    return {
      orders: customersOrdersList,
      partialPayments: payments,
      transferProducts
    }
  }

  async closeAccount(customerId: string, paymentMethod: string, discount: number) {
    const client = this.connection;
    if (!discount || discount <= 0) {
      await client?.query(
        `
        UPDATE balduino.order
        SET status = $1,
            updated_at = $2,
            payment_method = $3
        WHERE customer_id = $4 AND status = $5
        `,
        ['paid', new Date(), paymentMethod, customerId, 'delivered']
      );
      return;
    }
  
    const productsResult = await client?.query(
      `
      SELECT op.order_product_id, op.price, op.quantity
      FROM balduino.order_product op
      JOIN balduino.order o ON o.order_id = op.order_id
      WHERE o.customer_id = $1 AND o.status = 'delivered'
      ORDER BY op.order_product_id -- garante ordem fixa
      `,
      [customerId]
    );

    const products = productsResult || [];
  
    let remainingDiscount = discount;
  
    for (const product of products) {
      const totalProductValue = product.price * product.quantity;
  
      if (remainingDiscount <= 0) break;
  
      if (remainingDiscount < totalProductValue) {
        const newTotal = totalProductValue - remainingDiscount;
        const newPrice = newTotal / product.quantity;
        await client?.query(
          `
          UPDATE balduino.order_product
          SET price = $1
          WHERE order_product_id = $2
          `,
          [newPrice, product.order_product_id]
        );
  
        remainingDiscount = 0;
        break;
      }
  
      await client?.query(
        `
        UPDATE balduino.order_product
        SET price = 0
        WHERE order_product_id = $1
        `,
        [product.order_product_id]
      );
  
      remainingDiscount -= totalProductValue;
    }
  
    await client?.query(
      `
      UPDATE balduino.order
      SET status = $1,
          updated_at = $2,
          payment_method = $3
      WHERE customer_id = $4 AND status = $5
      `,
      ['paid', new Date(), paymentMethod, customerId, 'delivered']
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
        order.createdBy
      ],
    );

    await this.saveOrderProducts(order.orderId, order.products);
    return result;
  }

  
  async getOrdersToClosing(filters: any): Promise<any> {
    const dateParam = filters.date ? new Date(filters.date) : new Date();
    const formattedDate = dateParam.toISOString().split('T')[0];
    
    let queryParams: any[];
    

    if (filters.period === 'daily') {
        queryParams = [formattedDate];
    } else if (filters.period === 'monthly') {
      let startOfMonth;

      startOfMonth = new Date(Date.UTC(dateParam.getUTCFullYear(), dateParam.getUTCMonth(), 1));

      const formattedStartOfMonth = startOfMonth.toISOString().split('T')[0];
      queryParams = [formattedStartOfMonth];
    } else {
        throw new Error('Invalid period filter');
    }
   
    const result = await this.connection?.query(
      `
 SELECT
  final.payment_method,
  SUM(final.total_faturado) AS total_faturado
FROM (
  -- 1. Créditos adquiridos com forma de pagamento real (entrada de crédito)
  SELECT 
    cp.payment_method,
    cp.value AS total_faturado
  FROM 
    balduino.credit_payment cp
  WHERE 
    ${filters.period === 'monthly' ? 
      `cp.created_at >= date_trunc('month', $1::date) + INTERVAL '10 hours'
       AND cp.created_at < date_trunc('month', $1::date + INTERVAL '1 month')` :
      `(
          (EXTRACT(HOUR FROM cp.created_at) >= 10 AND cp.created_at::date = $1::date)
          OR
          (EXTRACT(HOUR FROM cp.created_at) < 9 AND cp.created_at::date = ($1::date + INTERVAL '1 day')::date)
      )`
    }

  UNION ALL

  SELECT
  o.payment_method,
  SUM(order_totals.total_price - COALESCE(cuo.used_credit, 0)) AS total_faturado
FROM
  balduino."order" o
JOIN (
    SELECT
      order_id,
      SUM(quantity * price) AS total_price
    FROM
      balduino.order_product
    WHERE quantity > 0
    GROUP BY
      order_id
) order_totals ON order_totals.order_id = o.order_id
LEFT JOIN (
    SELECT
      order_id AS order_id,
      SUM(value) AS used_credit
    FROM
      balduino.customer_credit_usage_orders
    GROUP BY
      usage_order_id
) cuo ON cuo.order_id = o.order_id
WHERE
  o.status = 'paid' 
  AND (
    cuo.used_credit IS NULL OR
    cuo.used_credit < order_totals.total_price
  )
  ${filters.period === 'monthly' ? 
    `AND o.updated_at >= date_trunc('month', $1::date) + INTERVAL '10 hours'
     AND o.updated_at < date_trunc('month', $1::date + INTERVAL '1 month')` :
    `AND (
        (EXTRACT(HOUR FROM o.updated_at) >= 10 AND o.updated_at::date = $1::date)
        OR
        (EXTRACT(HOUR FROM o.updated_at) < 9 AND o.updated_at::date = ($1::date + INTERVAL '1 day')::date)
    )`}
GROUP BY
  o.payment_method

  UNION ALL

  -- 3. Pagamentos parciais diretos
  SELECT
    pp.payment_method,
    SUM(pp.value) AS total_faturado
  FROM
    balduino.partial_payment pp
  JOIN
    balduino."order" o ON o.order_id = pp.order_id
  WHERE
    pp.payment_date >= $1::date + INTERVAL '7 hours'
    AND pp.payment_date < $1::date + INTERVAL '1 day' + INTERVAL '6 hours'
  GROUP BY
    pp.payment_method

) AS final
GROUP BY
  final.payment_method
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

  async getCustomerById(customerId: string): Promise<any> {
    
      const result = await this.connection?.query(
        `
         SELECT c.customer_id, c.name, c.phone, c.active, c.created_at, c.updated_at,
          array_agg(
              json_build_object('table_id', t.table_id, 'table_name', t.name, 'day', ct.day_of_week)
            ) AS customerTables
          FROM balduino.customer c
          LEFT JOIN balduino.customer_table ct ON c.customer_id = ct.customer_id
          LEFT JOIN balduino.table t ON t.table_id = ct.table_id
          WHERE c.customer_id = $1
          GROUP BY c.customer_id, c.name, c.phone, c.active, c.created_at, c.updated_at
        `,
        [customerId],
      );
      
      return result;
    
  }

  async getProductByType(type: string): Promise<any> {
    
    const result = await this.connection?.query(
      `
       SELECT p.product_id
       FROM balduino.product p
       WHERE p.type = $1
      `,
      [type],
    );
    
    return result;
  
  }

  async payCredit(creditPayment: CreditPayment): Promise<CreditPayment> {
    const result = await this.connection?.query(
      `INSERT INTO balduino.credit_payment 
        (credit_payment_id, payment_method, customer_origin_id, customer_destination_id, value, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        creditPayment.creditPaymentId,
        creditPayment.paymentMethod,
        creditPayment.customerOriginId,
        creditPayment.customerDestinationId,
        creditPayment.value,
        creditPayment.createdAt.toISOString(),
        creditPayment.updatedAt?.toISOString()
      ]
    );
    
    return result?.[0];
  }

  async getCreditByCustomer(customerId: string): Promise<number> {
    const result = await this.connection?.query(
      `
      SELECT
        COALESCE(cp_total.total, 0) - COALESCE(cu_total.total, 0) AS total
      FROM
        (
          SELECT SUM(value) AS total
          FROM balduino.credit_payment
          WHERE customer_destination_id = $1
        ) cp_total,
        (
          SELECT SUM(value) AS total
          FROM balduino.customer_credit_usage
          WHERE customer_id = $1
        ) cu_total
      `,
      [customerId]
    );
  
    return result?.[0]?.total ?? 0;
  }
  
  async transferProduct(orderProduct: TransferProduct): Promise<any> {
    const orders = await this.getOrderProducts(orderProduct.orderId);
    const product = orders.filter((order: any) => order.product_id === orderProduct.productId)

    if(product.length){
      const resultOrderProduct = await this.connection?.query(
        `UPDATE balduino.order_product 
         SET quantity = $1 
         WHERE order_id = $2 AND product_id = $3`,
        [
          product[0].quantity - orderProduct.quantity,
          orderProduct.orderId,
          orderProduct.productId,
        ]
      );
    }
    
    const orderEntity = new Order({
      customer_id: orderProduct.toCustomerId,
      created_by: orderProduct.createdBy,
      products: [{
        productId: orderProduct.productId,
        quantity: orderProduct.quantity,
        price: product[0].price
      }],
      status: orderProduct.status ?? OrderStatus.PENDING,
      table_id: orderProduct.tableId
    });

    const result = await this.save(orderEntity) as any;
    const transferProductHistoryEntity = new TransferProductHistory({ 
      fromOrderId: orderProduct.orderId,
      toOrderId: result.order_id,
      productId: orderProduct.productId,
      quantityTransferred: orderProduct.quantity,
      fromCustomerId: orderProduct.fromCustomerId,
      toCustomerId: orderProduct.toCustomerId,
    });

    await this.saveOrderTransferHistory(transferProductHistoryEntity);
    return null
  }

  async saveOrderTransferHistory(transferProductHistory: TransferProductHistory) {
    const result = await this.connection?.query(
      `INSERT INTO balduino.order_transfer_history
        (order_transfer_history_id, from_order_id, to_order_id, product_id, quantity_transferred, from_customer_id, to_customer_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        transferProductHistory.orderTransferHistoryId,
        transferProductHistory.fromOrderId,
        transferProductHistory.toOrderId,
        transferProductHistory.productId,
        transferProductHistory.quantityTransferred,
        transferProductHistory.fromCustomerId,
        transferProductHistory.toCustomerId,
        transferProductHistory.createdAt.toISOString(),
        transferProductHistory.updatedAt?.toISOString()
      ]
    );
  }
  
  
  async getTransferProductsByCustomerId(customerId: string, orderId: string): Promise<any[]> {
    const result = await this.connection?.query(
      ` 
        SELECT
          oth.order_transfer_history_id,
          oth.quantity_transferred as quantity,
          oth.created_at,
          op.price AS product_value,
          p.product_id,
          p.name AS product_name,
          cf.customer_id AS from_customer_id,
          cf.name AS from_customer_name,
          ct.customer_id AS to_customer_id,
          ct.name AS to_customer_name
        FROM balduino.order_transfer_history oth
        JOIN balduino.product p ON p.product_id = oth.product_id
        JOIN balduino.customer cf ON cf.customer_id = oth.from_customer_id
        JOIN balduino.customer ct ON ct.customer_id = oth.to_customer_id
        JOIN balduino.order o ON ot.order_id = oth.to_order_id
        JOIN balduino.order_product op ON op.order_id = oth.from_order_id AND op.product_id = oth.product_id
        WHERE ct.customer_id = $1 AND o.order_id = $2
      `,
      [customerId, orderId]
    );
  
    return result;
  }

  async getHistoricOrderByCustomer(customerId: string): Promise<any> {
    const result = await this.connection?.query(`
      SELECT 
        o.order_id, 
        o.order_number,
        o.created_at,
        c.name AS customer_name,
        c.customer_id AS customer_id, 
        t.table_id AS table_id, 
        o.status, 
        o.credit_origin, 
        p.product_id, 
        p.name AS product_name, 
        p.value AS product_value, 
        p.type, 
        op.quantity,
        op.price,
        t.name AS table_name,
  
        -- Pagamentos parciais
        COALESCE(pp.total_partial_payment, 0) AS total_partial_payment,
        pp.payments,
  
        -- Transferências recebidas
        COALESCE(tp.transfer_products, '[]') AS transfer_products
  
      FROM balduino.order o 
      JOIN balduino.order_product op ON o.order_id = op.order_id
      JOIN balduino.customer c ON c.customer_id = o.customer_id
      JOIN balduino.table t ON t.table_id = o.table_id
      JOIN balduino.product p ON p.product_id = op.product_id
  
      -- Pagamentos parciais agregados
      LEFT JOIN (
        SELECT 
            order_id,
            SUM(value) AS total_partial_payment,
            json_agg(
                json_build_object(
                    'payment_date', payment_date,
                    'payment_method', payment_method,
                    'value', value
                )
            ) AS payments
        FROM balduino.partial_payment
        GROUP BY order_id
      ) pp ON pp.order_id = o.order_id
  
      -- Transferências recebidas agregadas por produto/pedido
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'order_transfer_history_id', oth.order_transfer_history_id,
            'from_customer_id', cf.customer_id,
            'from_customer_name', cf.name,
            'quantity_transferred', oth.quantity_transferred,
            'product_name', p.name,
            'created_at', oth.created_at,
            'price', op_from.price
          )
        ) AS transfer_products
        FROM balduino.order_transfer_history oth
        JOIN balduino.customer cf ON cf.customer_id = oth.from_customer_id
        JOIN balduino.order_product op_from ON op_from.order_id = oth.from_order_id AND op_from.product_id = oth.product_id
        WHERE oth.to_order_id = o.order_id AND oth.product_id = p.product_id
      ) tp ON true
  
      WHERE c.customer_id = $1 
        AND o.status = 'paid'
        AND op.quantity > 0
  
      ORDER BY o.order_number, p.product_id;
    `, [customerId]);
  
    const customersOrdersList: { customerId: string, tableId: string, customerName: string, orders: any[], totalAmount: number }[] = [];
    let payments: any = [];
    let transferProducts: any = [];
  
    result?.forEach((row: any) => {
      const customerName = row.customer_name;
      const customerId = row.customer_id;
  
      if (row.transfer_products && row.order_id) {
        transferProducts.push(...row.transfer_products);
      }
  
      if (row.payments && row.order_id) {
        payments.push(...row.payments);
      }
  
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
          createdAt: row.created_at,
          status: row.status,
          tableName: row.table_name,
          tableId: row.table_id,
          products: [{
            productId: row.product_id,
            name: row.product_name,
            quantity: row.quantity,
            value: row.price,
            type: row.type,
            creditOrigin: row.credit_origin
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
          value: row.price,
          type: row.type,
          creditOrigin: row.credit_origin
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

    const timeline: { type: string; createdAt: string; data: any }[] = [];

    customersOrdersList.forEach(customer => {
      customer.orders.forEach(order => {
        timeline.push({
          type: 'order',
          createdAt: order.createdAt,
          data: {
            ...order,
            customerId: customer.customerId,
            customerName: customer.customerName,
            tableId: customer.tableId
          }
        });
      });
    });

    // Adiciona pagamentos parciais à timeline
    payments.forEach((payment: any) => {
      if (payment.payment_date) {
        timeline.push({
          type: 'payment',
          createdAt: payment.payment_date,
          data: payment
        });
      }
    });

    // Adiciona transferências recebidas à timeline
    transferProducts.forEach((transfer:any) => {
      if (transfer.created_at) {
        timeline.push({
          type: 'transfer',
          createdAt: transfer.created_at,
          data: transfer
        });
      }
    });

    // Ordena tudo por createdAt (mais recentes primeiro)
    timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
    const totalSpentOnOrders = timeline
      .filter(item => item.type === 'order')
      .reduce((total, item) => total + (item.data.totalValue || 0), 0);

    const totalTransfers = timeline
      .filter(item => item.type === 'transfer')
      .reduce((total, item) => total + ((item.data.price || 0) * (item.data.quantity_transferred || 0)), 0);

    const totalOverall = totalSpentOnOrders + totalTransfers;

    
    return {
      timeline,
      total: totalOverall
    };

  }
  
}
