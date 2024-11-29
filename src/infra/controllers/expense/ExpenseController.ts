import CreateExpenseUseCase from "../../../application/usecases/expense/CreateExpenseUseCase";
import DeleteExpenseUseCase from "../../../application/usecases/expense/DeleteExpenseUseCase";
import GetAllExpensesUseCase from "../../../application/usecases/expense/GetAllExpensesUseCase";
import GetExpenseByIdUseCase from "../../../application/usecases/expense/GetExpenseByIdUseCase";
import UpdateExpenseUseCase from "../../../application/usecases/expense/UpdateExpenseUseCase";
import { jwtGuard } from "../../AuthGuard/jwtGuard";
import HttpServer from "../../http/HttpServer";
import ExpenseDto from "./dto/ExpenseDto";

export default class ExpenseController {
  constructor(
    httpServer: HttpServer,
    createExpenseUseCase: CreateExpenseUseCase,
    updateExpenseUseCase: UpdateExpenseUseCase,
    deleteExpenseUseCase: DeleteExpenseUseCase,
    getAllExpenseUseCase: GetAllExpensesUseCase,
    getExpenseByIdUseCase: GetExpenseByIdUseCase,
  ) {
    httpServer.register(
      "post",
      "/expense",
      [jwtGuard],
      async (params: any, body: ExpenseDto) => {
        const response = await createExpenseUseCase.execute(body);
        return response;
      },
    );

    httpServer.register(
      "put",
      "/expense",
      [jwtGuard],
      async (params: any, body: ExpenseDto) => {
        await updateExpenseUseCase.execute(body);
      },
    );

    httpServer.register(
      "delete",
      "/expense/:expenseId",
      [jwtGuard],
      async (params: any, body: any) => {
        await deleteExpenseUseCase.execute(params.expenseId);
      },
    );

    httpServer.register(
      "get",
      "/expenses",
      [jwtGuard],
      async (params: any, body: any, query: any) => {
        return await getAllExpenseUseCase.execute(query);
      },
    );
   
    httpServer.register(
      "get",
      "/expenses/:expenseId",
      [jwtGuard],
      async (params: any, body: any) => {
        return await getExpenseByIdUseCase.execute(params.expenseId);
      },
    );
  }
}
