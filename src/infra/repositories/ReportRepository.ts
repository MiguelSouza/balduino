import IOrderRepository from "../../application/repositories/OrderRepository";
import DatabaseConnection from "../database/DatabaseConnection";

export default class ReportRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection,

  ) {
    this.connection = connection;
  }

  async getReportData(type: string, startDate: string, endDate: string): Promise<any[]> {
    if (type === 'orders') {
      return this.getOrders(startDate, endDate);
    } else if (type === 'expenses') {
      return this.getExpenses(startDate, endDate);
    } else if (type === 'products') {
      return this.getProductsSold(startDate, endDate);
    }
  
    return [];
  }

  async getOrders(startDate: string, endDate: string) {
    return this.connection?.query(`
     SELECT 
        o.order_number AS numero_pedido,
        o.created_at AS data_criacao,
        c.name AS nome_cliente,
        p.name AS nome_produto,
        op.quantity AS quantidade,
        t.name AS nome_mesa,
        u.name AS entregue_por
    FROM balduino.order o 
    JOIN balduino.order_product op ON o.order_id = op.order_id
    JOIN balduino.customer c ON c.customer_id = o.customer_id
    JOIN balduino.table t ON t.table_id = o.table_id
    JOIN balduino.product p ON p.product_id = op.product_id
    JOIN balduino.user u ON u.user_id = o.created_by
    WHERE p.type = 'common' and o.status = 'paid' and op.quantity > 0
            AND o.created_at BETWEEN $1 AND $2

    `, [startDate, endDate]);
  }  

  async getExpenses(startDate: string, endDate: string){
    return this.connection?.query(`
        SELECT 
            e.description as descricao, 
            e.value as valor,
            e.created_at as criado_em
        FROM balduino.expense e
        WHERE e.created_at BETWEEN $1 AND $2
      `, [startDate, endDate]);
  }

  async getProductsSold(startDate: string, endDate: string){
    return this.connection?.query(`
        SELECT 
            p.name as produto,
            p.value as valor,
            COALESCE(SUM(CASE WHEN o.status = 'paid' THEN op.quantity ELSE 0 END), 0) AS quantidade_vendido,
            COALESCE(SUM(CASE WHEN o.status = 'paid' THEN op.quantity * p.value ELSE 0 END), 0) AS valor_total_vendido
        FROM 
            balduino.product p
        LEFT JOIN 
            balduino.order_product op ON p.product_id = op.product_id
        LEFT JOIN 
            balduino.order o ON o.order_id = op.order_id
        WHERE p.type = 'common' and o.created_at BETWEEN $1 AND $2
        GROUP BY 
            p.product_id, p.name, p.value, p.image, p.active, p.created_at, p.updated_at, p.editable
        ORDER BY 
            quantidade_vendido DESC;
      `, [startDate, endDate]);
  }
}
