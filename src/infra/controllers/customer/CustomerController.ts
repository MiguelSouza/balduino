import CreateCustomerUseCase from "../../../application/usecases/customer/CreateCustomerUseCase";
import DeleteCustomerUseCase from "../../../application/usecases/customer/DeleteCustomerUseCase";
import GetAllCustomerUseCase from "../../../application/usecases/customer/GetAllCustomerUseCase";
import GetCustomerByIdUseCase from "../../../application/usecases/customer/GetCustomerByIdUseCase";
import UpdateCustomerUseCase from "../../../application/usecases/customer/UpdateCustomerUseCase";
import { jwtGuard } from "../../AuthGuard/jwtGuard";
import HttpServer from "../../http/HttpServer";
import CustomerDto from "./dto/CustomerDto";

export default class CustomerController {
  constructor(
    httpServer: HttpServer,
    createCustomerUseCase: CreateCustomerUseCase,
    updateCustomerUseCase: UpdateCustomerUseCase,
    deleteCustomerUseCase: DeleteCustomerUseCase,
    getAllCustomerUseCase: GetAllCustomerUseCase,
    getCustomerByIdUseCase: GetCustomerByIdUseCase,
  ) {
    httpServer.register(
      "post",
      "/customer",
      [jwtGuard],
      async (params: any, body: CustomerDto) => {
        const response = await createCustomerUseCase.execute(body);
        return response;
      },
    );

    httpServer.register(
      "put",
      "/customer",
      [jwtGuard],
      async (params: any, body: any) => {
        await updateCustomerUseCase.execute(body);
      },
    );

    httpServer.register(
      "delete",
      "/customer/:customerId",
      [jwtGuard],
      async (params: any, body: any) => {
        await deleteCustomerUseCase.execute(params.customerId);
      },
    );

    httpServer.register(
      "get",
      "/customers",
      [jwtGuard],
      async (params: any, body: any, query: any) => {
        return await getAllCustomerUseCase.execute(query);
      },
    );

    httpServer.register(
      "get",
      "/customers/:customerId",
      [jwtGuard],
      async (params: any, body: any) => {
        return await getCustomerByIdUseCase.execute(params.customerId);
      },
    );
  }
}
