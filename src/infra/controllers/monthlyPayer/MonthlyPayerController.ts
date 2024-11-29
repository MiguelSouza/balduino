import CreateMonthlyPayerUseCase from "../../../application/usecases/monthlyPayer/CreateMonthlyPayerUseCase";
import DeleteMonthlyPayerUseCase from "../../../application/usecases/monthlyPayer/DeleteMonthlyPayerUseCase";
import GetAllMonthlyPayerUseCase from "../../../application/usecases/monthlyPayer/GetAllMonthlyPayerUseCase";
import GetMonthlyPayerByIdUseCase from "../../../application/usecases/monthlyPayer/GetMonthlyPayerByIdUseCase";
import GetPaymentsByMonthlyPayerUseCase from "../../../application/usecases/monthlyPayer/GetPaymentsByMonthlyPayerUseCase";
import PaymentMonthlyUseCase from "../../../application/usecases/monthlyPayer/PaymentMonthlyUseCase";
import UpdateMonthlyPayerUseCase from "../../../application/usecases/monthlyPayer/UpdateMonthlyPayerUseCase";
import { jwtGuard } from "../../AuthGuard/jwtGuard";
import HttpServer from "../../http/HttpServer";
import MonthlyPayerDto from "./dto/MonthlyPayerDto";

export default class MonthlyPayerController {
  constructor(
    httpServer: HttpServer,
    createMonthlyPayerUseCase: CreateMonthlyPayerUseCase,
    updateMonthlyPayerUseCase: UpdateMonthlyPayerUseCase,
    deleteMonthlyPayerUseCase: DeleteMonthlyPayerUseCase,
    getAllMonthlyPayerUseCase: GetAllMonthlyPayerUseCase,
    getMonthlyPayerByIdUseCase: GetMonthlyPayerByIdUseCase,
    getPaymentsByMonthlyPayerUseCase: GetPaymentsByMonthlyPayerUseCase,
    paymentMonthlyUseCase: PaymentMonthlyUseCase
  ) {
    httpServer.register(
      "post",
      "/monthlypayer",
      [jwtGuard],
      async (params: any, body: MonthlyPayerDto) => {
        const response = await createMonthlyPayerUseCase.execute(body);
        return response;
      },
    );

    httpServer.register(
      "put",
      "/monthlypayer",
      [jwtGuard],
      async (params: any, body: MonthlyPayerDto) => {
        await updateMonthlyPayerUseCase.execute(body);
      },
    );

    httpServer.register(
      "delete",
      "/monthlypayer/:monthlyPayerId",
      [jwtGuard],
      async (params: any, body: any) => {
        await deleteMonthlyPayerUseCase.execute(params.monthlyPayerId);
      },
    );

    httpServer.register(
      "get",
      "/monthlypayers",
      [jwtGuard],
      async (params: any, body: any, query: any) => {
        return await getAllMonthlyPayerUseCase.execute(query);
      },
    );
   
    httpServer.register(
      "get",
      "/monthlypayers/:monthlyPayerId",
      [jwtGuard],
      async (params: any, body: any) => {
        return await getPaymentsByMonthlyPayerUseCase.execute(params.monthlyPayerId);
      },
    );

    httpServer.register(
      "post",
      "/monthlypay",
      [jwtGuard],
      async (params: any, body: any) => {
        const response = await paymentMonthlyUseCase.execute(body);
        return response;
      },
    );
  }
}
