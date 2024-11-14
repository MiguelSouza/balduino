import CreateTableUseCase from "../../../application/usecases/table/CreateTableUseCase";
import DeleteTableUseCase from "../../../application/usecases/table/DeleteTableUseCase";
import GetAllUseCase from "../../../application/usecases/table/GetAllTableUseCase";
import GetTablesByIdUseCase from "../../../application/usecases/table/GetTablesByIdUseCase";
import UpdateTableUseCase from "../../../application/usecases/table/UpdateTableUseCase";
import { jwtGuard } from "../../AuthGuard/jwtGuard";
import HttpServer from "../../http/HttpServer";
import TableDto from "./dto/TableDto";

export default class TableController {
  constructor(
    httpServer: HttpServer,
    createTableUseCase: CreateTableUseCase,
    updateTableUseCase: UpdateTableUseCase,
    deleteTableUseCase: DeleteTableUseCase,
    getAllUseCase: GetAllUseCase,
    getTableByIdUseCase: GetTablesByIdUseCase,
  ) {
    httpServer.register(
      "post",
      "/table",
      [jwtGuard],
      async (params: any, body: TableDto) => {
        const response = await createTableUseCase.execute(body);
        return response;
      },
    );

    httpServer.register(
      "put",
      "/table",
      [jwtGuard],
      async (params: any, body: any) => {
        await updateTableUseCase.execute(body);
      },
    );

    httpServer.register(
      "delete",
      "/table/:tableId",
      [jwtGuard],
      async (params: any, body: any) => {
        await deleteTableUseCase.execute(body.TableId);
      },
    );

    httpServer.register(
      "get",
      "/tables",
      [jwtGuard],
      async (params: any, body: any, query: any) => {
        return await getAllUseCase.execute(query);
      },
    );

    httpServer.register(
      "get",
      "/tables/:tableId",
      [jwtGuard],
      async (params: any, body: any) => {
        return await getTableByIdUseCase.execute(params.tableId);
      },
    );
  }
}
