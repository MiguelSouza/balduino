import GenerateReportUseCase from "../../../application/usecases/report/GenerateReportUseCase";
import { jwtGuard } from "../../AuthGuard/jwtGuard";
import HttpServer from "../../http/HttpServer";


export default class ReportController {
  constructor(
    httpServer: HttpServer,
    generateReportUseCase: GenerateReportUseCase,
  ) {
    httpServer.register(
        "post",
        "/report/:type",
        [jwtGuard],
        async (params: any, body: { startDate: string; endDate: string }, query: any, file: any, res: any) => {
          const { startDate, endDate } = body;
          const { type } = params;
      
          const buffer = await generateReportUseCase.execute({
            type,
            startDate,
            endDate
          });
      
      
          res.setHeader('Content-Disposition', 'attachment; filename=relatorio.xlsx');
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.send(buffer);
        }
      );
  }
}
