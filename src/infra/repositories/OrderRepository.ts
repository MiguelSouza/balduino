import IOrderRepository from "../../application/repositories/OrderRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Order, { OrderStatus } from "../domain/Order";
import { v4 as uuid } from "uuid";
import PartialPayment from "../domain/PartialPayment";
import CreditPayment from "../domain/CreditPayment";
import CreditPaymentUsage from "../domain/CreditPaymentUsage";
import CustomerRepository from "./CustomerRepository";

export default class OrderRepository implements IOrderRepository {
  connection?: DatabaseConnection;
  customerRepository: CustomerRepository;
  constructor(connection: DatabaseConnection,
    customerRepository: CustomerRepository
  ) {
    this.connection = connection;
    this.customerRepository = customerRepository;
  }

  getByCustomer(customerId: string): Promise<Order> {
    throw new Error("Method not implemented.");
  }
  getByTable(tableId: string): Promise<Order> {
    throw new Error("Method not implemented.");
  }

  async save(order: Order): Promise<Order> {
    const result = await this.connection?.query(
      `INSERT INTO balduino.order (order_id, customer_id, table_id, status, created_at, updated_at,created_by, credit_destination)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        order.orderId,
        order.customerId,
        order.tableId,
        order.status || null,
        order.createdAt.toISOString(),
        order.updatedAt?.toISOString(),
        order.createdBy,
        order.creditDestination
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
  
  async payCreditOrder(creditPaymentUsage: CreditPaymentUsage): Promise<void> {
    const orders = await this.getAllOrdersByCustomer(creditPaymentUsage.customerId || '');
    const orderTotal = orders?.[0]?.totalAmount || 0;

    const result = await this.connection?.query(
      `
      SELECT
        COALESCE(SUM(cp.value), 0) - COALESCE(SUM(cu.value), 0) AS total
      FROM
        balduino.credit_payment cp
      LEFT JOIN
        balduino.customer_credit_usage cu ON cp.customer_destination_id = cu.customer_id
      WHERE
        cp.customer_destination_id = $1
      `,
      [creditPaymentUsage.customerId]
    );

    const availableCredit = result?.[0]?.total || 0;

    if (availableCredit > 0 && orderTotal > 0) {
      
      const valueToSave = Math.min(orderTotal, availableCredit);

      
      await this.connection?.query(
        `INSERT INTO balduino.customer_credit_usage (
            usage_id,
            customer_id,
            value,
            created_at,
            updated_at
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          creditPaymentUsage.creditPaymentUsageId,
          creditPaymentUsage.customerId,
          valueToSave,
          creditPaymentUsage.createdAt.toISOString(),
          creditPaymentUsage.updatedAt?.toISOString(),
        ]
      );

      console.log('Crédito usado registrado:', valueToSave);
    } else {
      console.log('Nenhum crédito usado ou crédito insuficiente para registrar.');
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
      o.created_at,
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
        c.name AS customer_name,
        c.customer_id AS customer_id, 
        t.table_id AS table_id, 
        o.status, 
        o.credit_destination, 
        p.product_id, 
        p.name AS product_name, 
        p.value AS product_value, 
        p.type, 
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
          createdAt: row.created_at,
          status: row.status,
          tableName: row.table_name,
          products: [{
            productId: row.product_id,
            name: row.product_name,
            quantity: row.quantity,
            value: row.price,
            type: row.type,
            creditDestination: row.credit_destination
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
          creditDestination: row.credit_destination
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
    const creditPaymentUsage = new CreditPaymentUsage({
      customer_id: customerId,
      value: 0,
    })
    await this.payCreditOrder(creditPaymentUsage)

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
    payment_method,
    SUM(total_faturado) AS total_faturado
FROM (
    -- Subconsulta para calcular o total de cada order com ajuste de partial payments
    SELECT 
        o.payment_method,                          
        -- Calculando o total ajustado com base no valor de partial_payment
        CASE 
            WHEN pp.value IS NOT NULL THEN 
                (SUM(op.quantity * op.price) - pp.value)  -- Subtrai o partial_payment do total da order
            ELSE 
                SUM(op.quantity * op.price)  -- Se não houver partial_payment, usa o total da order normalmente
        END AS total_faturado
    FROM 
        balduino."order" o
    JOIN 
        balduino.order_product op ON o.order_id = op.order_id
    LEFT JOIN 
        balduino.partial_payment pp ON o.order_id = pp.order_id  -- Juntando com partial_payment para ajustar o valor
    WHERE 
        o.status = 'paid'
        ${filters.period === 'monthly' ? 
            `AND (
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
        o.payment_method, o.order_id, pp.value  -- Agrupando por order_id para garantir que o ajuste seja feito corretamente

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

  /*async transferBill(transferBill: any): Promise<any> {
    const result = await this.connection?.query(
      `INSERT INTO balduino.customer_balance_transfer
        (transfer_id, from_customer_id, to_customer_id, status, value, transfer_date) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        transferBill.transferBillId,
        transferBill.fromCustomerId,
        transferBill.toCustomerId,
        transferBill.status,
        transferBill.value,
        transferBill.transferDate.toString(),
      ]
    );
    
    return result;
  }*/

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
        (credit_payment_id, customer_origin_id, customer_destination_id, value, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        creditPayment.creditPaymentId,
        creditPayment.customerOriginId,
        creditPayment.customerDestinationId,
        creditPayment.value,
        creditPayment.createdAt.toISOString(),
        creditPayment.updatedAt?.toISOString()
      ]
    );
    
    const customer = await this.getCustomerById(creditPayment.customerOriginId || creditPayment.customerId || '');
    const product = await this.getProductByType('credit');
   
    const orderEntity = new Order({
      customer_id: customer[0].customer_id,
      table_id: customer[0].customertables[0].table_id,
      status: OrderStatus.DELIVERED,
      created_by: creditPayment.createdBy,
      credit_destination: customer[0].name,
      products: [{
        productId: product[0].product_id,
        quantity: 1,
        price: creditPayment.value
      }]
    })
    const orderResult = await this.save(orderEntity);

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
  
  
}
