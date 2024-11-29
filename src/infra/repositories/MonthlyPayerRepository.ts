import IMonthlyPayerRepository from "../../application/repositories/MonthlyPayerRepository";
import PaymentMonthUseCase from "../../application/usecases/monthlyPayer/PaymentMonthlyUseCase";
import DatabaseConnection from "../database/DatabaseConnection";
import MonthlyPayer from "../domain/MonthlyPayers";
import Payment from "../domain/Payment";

export default class MonthlyPayerRepository implements IMonthlyPayerRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  async save(monthlyPayer: MonthlyPayer): Promise<MonthlyPayer> {
    return this.connection?.query(
      "insert into balduino.monthly_payers (monthly_payer_id, name, value, created_at, updated_at) values ($1, $2, $3, $4, $5) RETURNING *",
      [
        monthlyPayer.monthlyPayerId,
        monthlyPayer.name,
        monthlyPayer.value,
        monthlyPayer.createdAt,
        monthlyPayer.updatedAt,
      ],
    );
  }

  async update(monthlyPayer: MonthlyPayer): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.monthly_payers
            SET name = $1, value = $2, updated_at = $3
            WHERE monthly_payer_id = $4`,
      [
        monthlyPayer.name,
        monthlyPayer.value,,
        new Date(),
        monthlyPayer.monthlyPayerId,
      ],
    );
  }

  async getByName(name: string): Promise<MonthlyPayer> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.monthly_payers WHERE name like '%$1%'",
      [name],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getById(monthlyPayerId: string): Promise<MonthlyPayer> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.monthly_payers WHERE monthly_payer_id = $1",
      [monthlyPayerId],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getAll(query: any): Promise<MonthlyPayer[]> {
    return this.connection?.query(`

      SELECT 
      mp.monthly_payer_id,
      mp.name,
      mp.value,
      COALESCE(MAX(p.due_date), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '10 day') AS due_date,
      CASE 
          -- Caso haja um pagamento 'paid' no mês atual, retorna 'paid'
          WHEN EXISTS (
              SELECT 1 
              FROM balduino.payments p2
              WHERE p2.monthly_payer_id = mp.monthly_payer_id
                AND p2.status = 'paid'
                AND EXTRACT(YEAR FROM p2.due_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM p2.due_date) = EXTRACT(MONTH FROM CURRENT_DATE)
          ) THEN 'paid'
          
          -- Caso haja um pagamento 'pending' com due_date anterior ao atual, retorna 'overdue'
          WHEN EXISTS (
              SELECT 1 
              FROM balduino.payments p2
              WHERE p2.monthly_payer_id = mp.monthly_payer_id
                AND p2.status = 'pending'
                AND p2.due_date < CURRENT_DATE
          ) THEN 'overdue'
          
          -- Caso haja um pagamento 'pending' com due_date posterior ou igual ao atual, retorna 'pending'
          WHEN EXISTS (
              SELECT 1 
              FROM balduino.payments p2
              WHERE p2.monthly_payer_id = mp.monthly_payer_id
                AND p2.status = 'pending'
                AND p2.due_date >= CURRENT_DATE
          ) THEN 'pending'
          
          -- Caso não haja pagamentos pendentes e o dia 10 já passou, retorna 'overdue'
          WHEN NOT EXISTS (
              SELECT 1 
              FROM balduino.payments p2
              WHERE p2.monthly_payer_id = mp.monthly_payer_id 
                AND p2.status = 'pending'
          ) AND CURRENT_DATE > DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '9 day' THEN 'overdue'
          
          -- Caso não haja pagamentos pendentes e o dia 10 ainda não tenha passado, retorna 'pending'
          WHEN NOT EXISTS (
              SELECT 1 
              FROM balduino.payments p2
              WHERE p2.monthly_payer_id = mp.monthly_payer_id 
                AND p2.status = 'pending'
          ) AND CURRENT_DATE <= DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '9 day' THEN 'pending'
          
          -- Se não se encaixar em nenhum dos casos acima, retorna 'unknown'
          ELSE 'unknown' 
      END AS status
  FROM 
      balduino.monthly_payers mp
  LEFT JOIN 
      balduino.payments p ON mp.monthly_payer_id = p.monthly_payer_id
  GROUP BY 
      mp.monthly_payer_id, mp.name, mp.value;
  
`, null);
  }
  
  async delete(monthlyPayerId: string): Promise<void> {
    this.connection?.query(
      "delete from balduino.monthly_payers where monthly_payer_id = $1",
      [monthlyPayerId],
    );
  }

  async saveNextPayment(payment: Payment){
    return this.connection?.query(
      "insert into balduino.payments (payment_id, monthly_payer_id, payment_date, value, due_date, status, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        payment.paymentId,
        payment.monthPayerId,
        payment.paymentDate,
        payment.value,
        payment.dueDate,
        payment.status,
        payment.createdAt,
        payment.updatedAt,
      ],
    );
  }

  async payMonthly(payment: Payment): Promise<Payment> {
    return await this.connection?.query(
      `UPDATE balduino.payments
            SET status = $1, payment_date = $2, updated_at = $3
            WHERE payment_id = $4`,
      [
        payment.status,
        payment.paymentDate,
        new Date(),
        payment.paymentId,
      ],
    );
  }

  async getPaymentsByMonthlyPayer(monthlyPayerId: string): Promise<Payment[]> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.payments WHERE monthly_payer_id = $1 ORDER BY created_at desc",
      [monthlyPayerId],
    );
    return result;
  }

}
