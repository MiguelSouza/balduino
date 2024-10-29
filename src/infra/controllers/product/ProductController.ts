import CreateProductUseCase from "../../../application/usecases/product/CreateProductUseCase";
import DeleteProductUseCase from "../../../application/usecases/product/DeleteProductUseCase";
import GetAllProductsUseCase from "../../../application/usecases/product/GetAllProductsUseCase";
import GetProductByIdUseCase from "../../../application/usecases/product/GetProductByIdUseCase";
import UpdateProductUseCase from "../../../application/usecases/product/UpdateProductUseCase";
import { jwtGuard } from "../../AuthGuard/jwtGuard";
import HttpServer from "../../http/HttpServer";
import ProductDto from "./dto/ProductDto";

export default class ProductController {
  constructor(
    httpServer: HttpServer,
    createProductUseCase: CreateProductUseCase,
    updateProductUseCase: UpdateProductUseCase,
    deleteProductUseCase: DeleteProductUseCase,
    getAllProductUseCase: GetAllProductsUseCase,
    getProductByIdUseCase: GetProductByIdUseCase,
  ) {
    httpServer.register(
      "post",
      "/product",
      [jwtGuard],
      async (params: any, body: ProductDto) => {
        const response = await createProductUseCase.execute(body);
        return response;
      },
    );

    httpServer.register(
      "put",
      "/product",
      [jwtGuard],
      async (params: any, body: any) => {
        await updateProductUseCase.execute(body);
      },
    );

    httpServer.register(
      "delete",
      "/product/:productId",
      [jwtGuard],
      async (params: any, body: any) => {
        await deleteProductUseCase.execute(body.productId);
      },
    );

    httpServer.register(
      "get",
      "/products",
      [jwtGuard],
      async (params: any, body: any) => {
        return await getAllProductUseCase.execute();
      },
    );

    httpServer.register(
      "get",
      "/products/:productId",
      [jwtGuard],
      async (params: any, body: any) => {
        return await getProductByIdUseCase.execute(params.productId);
      },
    );
  }
}
