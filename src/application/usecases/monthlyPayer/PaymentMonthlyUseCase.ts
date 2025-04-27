import MonthlyPayerRepository from "../../../infra/repositories/MonthlyPayerRepository";
import Payment, { PaymentStatus } from "../../../infra/domain/Payment";

export default class PaymentMonthlyUseCase {
  monthlyPayerRepository?: MonthlyPayerRepository;

  constructor(monthlyPayerRepository: MonthlyPayerRepository) {
    this.monthlyPayerRepository = monthlyPayerRepository;
  }

  async execute(payment: any): Promise<any> {
    try {
      const defaultMonthly = 600;
      const monthlyPayerData = await this.monthlyPayerRepository?.getById(payment.monthlyPayerId);

      const paymentData: any = await this.monthlyPayerRepository?.getPaymentsByMonthlyPayer(payment.monthlyPayerId);
      
      let currentPaymentResponse;

      if (paymentData?.length) {
        const paymentEntity = new Payment({
          payment_id: paymentData[0].payment_id,
          due_date: paymentData[0].due_date,
          monthly_payer_id: payment.monthlyPayerId,
          payment_date: new Date(),
          value: monthlyPayerData?.value ?? defaultMonthly,
          status: 'paid' as PaymentStatus,
        });
        currentPaymentResponse = await this.monthlyPayerRepository?.payMonthly(paymentEntity);
      } else {
        const currentDate = new Date();
        const defaultDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 10);
        const dueDate = payment.dueDate ?? defaultDueDate;
        const newPaymentEntity = new Payment({
          monthly_payer_id: payment.monthlyPayerId,
          due_date: dueDate,
          payment_date: currentDate, 
          value: monthlyPayerData?.value ?? defaultMonthly,
          status: 'paid' as PaymentStatus,
        });

        currentPaymentResponse = await this.monthlyPayerRepository?.saveNextPayment(newPaymentEntity);
      }

      const nextMonthDate = paymentData.length > 0 ? paymentData[0].due_date ?? new Date() : new Date();

      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextDueDate = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 10);

      const nextPaymentEntity = new Payment({
        monthly_payer_id: payment.monthlyPayerId,
        due_date: nextDueDate,
        value: monthlyPayerData?.value ?? defaultMonthly,
        status: 'pending' as PaymentStatus,
      });

      const responseNextPayment = await this.monthlyPayerRepository?.saveNextPayment(nextPaymentEntity);

      return {
        payment: currentPaymentResponse,
        nextPayment: responseNextPayment,
      };
    } catch (err: any) {
      return {
        payment: undefined,
        errorMessage: err.message,
      };
    }
  }
}
