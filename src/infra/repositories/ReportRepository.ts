import DatabaseConnection from "../database/DatabaseConnection";
import { startOfMonth, endOfMonth } from 'date-fns';

export default class ReportRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection,

  ) {
    this.connection = connection;
  }

  getDateRangeFromMonths(startMonth: string, endMonth: string): [string, string] {
    const start = startOfMonth(startMonth).toISOString().split('T')[0];
    const end = endOfMonth(endMonth).toISOString().split('T')[0];
    return [start, end];
  }

  async getReportData(type: string, startDate: string, endDate: string): Promise<any[]> {
    if (type === 'sales') {
      return this.getSales(startDate, endDate);
    } else if (type === 'expenses') {
      return this.getExpenses(startDate, endDate);
    } else if (type === 'products') {
      return this.getProductsSold(startDate, endDate);
    } else if (type === 'orders') {
      return this.getOrders(startDate, endDate);
    }
  
    return [];
  }

  async getSales(startMonth: string, endMonth: string) {
    const [startDate, endDate] = this.getDateRangeFromMonths(startMonth, endMonth);
  
    return this.connection?.query(`
      SELECT 
        o.order_number AS numero_pedido,
        o.created_at AS data_criacao,
        c.name AS nome_cliente,
        p.name AS nome_produto,
        op.quantity AS quantidade,
        op.price AS valor,
        (op.quantity * op.price) AS valor_total,
        t.name AS nome_mesa,
        u.name AS entregue_por
      FROM balduino.order o 
      JOIN balduino.order_product op ON o.order_id = op.order_id
      JOIN balduino.customer c ON c.customer_id = o.customer_id
      JOIN balduino.table t ON t.table_id = o.table_id
      JOIN balduino.product p ON p.product_id = op.product_id
      JOIN balduino.user u ON u.user_id = o.created_by
      WHERE p.type = 'common' 
        AND o.status = 'paid' 
        AND op.quantity > 0
        AND o.created_at BETWEEN $1 AND $2
    `, [startDate, endDate]);
  }

  async getOrders(startMonth: string, endMonth: string) {
    const [startDate, endDate] = this.getDateRangeFromMonths(startMonth, endMonth);
    return this.connection?.query(`
     SELECT 
        o.order_number AS numero_pedido,
        o.created_at AS data_criacao,
        c.name AS nome_cliente,
        p.name AS nome_produto,
        op.quantity AS quantidade,
        CASE 
          WHEN o.status = 'paid' THEN 'Pago'
          WHEN o.status = 'delivered' THEN 'Entregue'
          ELSE o.status
        END AS status,
        op.price AS valor,
         (op.quantity * op.price) AS valor_total,
        t.name AS nome_mesa,
        u.name AS entregue_por
    FROM balduino.order o 
    JOIN balduino.order_product op ON o.order_id = op.order_id
    JOIN balduino.customer c ON c.customer_id = o.customer_id
    JOIN balduino.table t ON t.table_id = o.table_id
    JOIN balduino.product p ON p.product_id = op.product_id
    JOIN balduino.user u ON u.user_id = o.created_by
    WHERE p.type = 'common' and (o.status = 'paid' or o.status = 'delivered') and op.quantity > 0
            AND o.created_at BETWEEN $1 AND $2

    `, [startDate, endDate]);
  }  

  async getExpenses(startMonth: string, endMonth: string){
    const [startDate, endDate] = this.getDateRangeFromMonths(startMonth, endMonth);
    return this.connection?.query(`
        SELECT 
            e.description as descricao, 
            e.value as valor,
            e.created_at as criado_em
        FROM balduino.expense e
        WHERE e.created_at BETWEEN $1 AND $2
      `, [startDate, endDate]);
  }

  async getProductsSold(startMonth: string, endMonth: string){
    const [startDate, endDate] = this.getDateRangeFromMonths(startMonth, endMonth);
    return this.connection?.query(`
      SELECT 
          p.name as produto,
          p.value as valor,
          TO_CHAR(o.created_at, 'YYYY-MM') AS ano_mes,  -- mês para filtro/ordenar
          TO_CHAR(o.created_at, 'TMMonth') AS nome_mes, -- nome do mês por extenso em português
          COALESCE(SUM(CASE WHEN o.status = 'paid' THEN op.quantity ELSE 0 END), 0) AS quantidade_vendido,
          COALESCE(SUM(CASE WHEN o.status = 'paid' THEN op.quantity * p.value ELSE 0 END), 0) AS valor_total_vendido
      FROM 
          balduino.product p
      LEFT JOIN 
          balduino.order_product op ON p.product_id = op.product_id
      LEFT JOIN 
          balduino.order o ON o.order_id = op.order_id
      WHERE 
          p.type = 'common' 
          AND o.created_at BETWEEN $1 AND $2
      GROUP BY 
          p.product_id, p.name, p.value, TO_CHAR(o.created_at, 'YYYY-MM'), TO_CHAR(o.created_at, 'TMMonth')
      ORDER BY 
          ano_mes ASC,
          quantidade_vendido DESC;
      `, [startDate, endDate]);
  }
}
