import ExcelJS from 'exceljs';
import ReportDto from "../../../infra/controllers/report/dto/ReportDto";
import ReportRepository from '../../../infra/repositories/ReportRepository';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default class GenerateReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute({ type, startDate, endDate }: ReportDto): Promise<Buffer> {
    const data = await this.reportRepository.getReportData(type, startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map((key) => ({
        header: key,
        key: key,
        width: 20
      }));
    }

    data.forEach((row: any) => {
        const formattedRow: any = {};
      
        for (const key in row) {
          const value = row[key];
      
          if (value instanceof Date) {
            formattedRow[key] = format(value, 'dd/MM/yyyy', { locale: ptBR });
          } else if (
            typeof value === 'number' &&
            /(valor|preço|total|preco)/i.test(key) &&
            key !== 'valor_total' // impede formatação com R$ se for valor_total
          ) {
            formattedRow[key] = currencyFormatter.format(value);
          } else {
            formattedRow[key] = value;
          }
        }
      
        worksheet.addRow(formattedRow);
      });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return buffer;
  }
}
