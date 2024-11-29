import CloseAccountUseCase from "../../../application/usecases/order/CloseAccountUseCase";
import CloseAccountWithoutCustomerUseCase from "../../../application/usecases/order/CloseAccountWithoutCustomerUseCase";
import CreateOrderUseCase from "../../../application/usecases/order/CreateOrderUseCase";
import DeleteOrderUseCase from "../../../application/usecases/order/DeleteOrderUseCase";
import GetAllOrdersByCustomerUseCase from "../../../application/usecases/order/GetAllOrdersByCustomerUseCase copy";
import GetAllOrdersUseCase from "../../../application/usecases/order/GetAllOrdersUseCase";
import GetOrderByIdUseCase from "../../../application/usecases/order/GetOrderById";
import GetOrdersToCloseOfTheDayUseCase from "../../../application/usecases/order/GetOrdersToCloseOfTheDayUseCase";
import PartialPaymentUseCase from "../../../application/usecases/order/PartialPaymentUseCase";
import UpdateOrderUseCase from "../../../application/usecases/order/UpdateOrderUseCase";
import { jwtGuard } from "../../AuthGuard/jwtGuard";
import PartialPayment from "../../domain/PartialPayment";
import HttpServer from "../../http/HttpServer";
import OrderDto from "./dto/OrderDto";

export default class OrderController {
  constructor(
    httpServer: HttpServer,
    createOrderUseCase: CreateOrderUseCase,
    updateOrderUseCase: UpdateOrderUseCase,
    deleteOrderUseCase: DeleteOrderUseCase,
    getAllOrdersUseCase: GetAllOrdersUseCase,
    getAllOrdersByCustomerUseCase: GetAllOrdersByCustomerUseCase,
    getOrderByIdUseCase: GetOrderByIdUseCase,
    closeAccountUseCase: CloseAccountUseCase,
    closeAccountWithoutCustomerUseCase: CloseAccountWithoutCustomerUseCase,
    getOrdersToCloseOfTheDayUseCase: GetOrdersToCloseOfTheDayUseCase,
    partialPaymentUseCase: PartialPaymentUseCase,
  ) {
    httpServer.register(
      "post",
      "/order",
      [jwtGuard],
      async (params: any, body: OrderDto) => {
        const response = await createOrderUseCase.execute(body);
        return response;
      },
    );

    httpServer.register(
      "put",
      "/order",
      [jwtGuard],
      async (params: any, body: any) => {
        await updateOrderUseCase.execute(body);
      },
    );

    httpServer.register(
      "delete",
      "/order/:orderId",
      [jwtGuard],
      async (params: any, body: any) => {
        await deleteOrderUseCase.execute(body.orderId);
      },
    );

    httpServer.register(
      "get",
      "/orders",
      [jwtGuard],
      async (params: any, body: any, query: any) => {
        return await getAllOrdersUseCase.execute(query);
      },
    );

    httpServer.register(
      "get",
      "/orders/:customer_id/bill",
      [jwtGuard],
      async (params: any, body: any) => {
        return await getAllOrdersByCustomerUseCase.execute(params.customer_id);
      },
    );

    httpServer.register(
      "get",
      "/order/:orderId",
      [jwtGuard],
      async (params: any, body: any) => {
        return await getOrderByIdUseCase.execute(params.orderId);
      },
    );

    httpServer.register(
      "post",
      "/order/:customerId/close",
      [jwtGuard],
      async (params: any, body: any) => {
        return await closeAccountUseCase.execute(params.customerId, body.paymentMethod);
      },
    );

    httpServer.register(
      "post",
      "/order/close",
      [jwtGuard],
      async (params: any, body: any) => {
        return await closeAccountWithoutCustomerUseCase.execute(body);
      },
    );

    httpServer.register(
      "get",
      "/closeofday",
      [jwtGuard],
      async (params: any, body: any, query: any) => {
        return await getOrdersToCloseOfTheDayUseCase.execute(query);
      },
    );

    httpServer.register(
      "post",
      "/partialpay",
      [jwtGuard],
      async (params: any, body: any) => {
        return await partialPaymentUseCase.execute(body);
      },
    );
  }
}
