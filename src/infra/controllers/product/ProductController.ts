import CreateProductUseCase from "../../../application/usecases/product/CreateProductUseCase";
import DeleteProductUseCase from "../../../application/usecases/product/DeleteProductUseCase";
import GetAllProductsUseCase from "../../../application/usecases/product/GetAllProductsUseCase";
import GetProductByIdUseCase from "../../../application/usecases/product/GetProductByIdUseCase";
import UpdateProductUseCase from "../../../application/usecases/product/UpdateProductUseCase";
import UploadImageUseCase from "../../../application/usecases/product/UploadImageUseCase";
import { jwtGuard } from "../../AuthGuard/jwtGuard";
import HttpServer from "../../http/HttpServer";
import ProductDto from "./dto/ProductDto";
import multer from "multer";
import path from "path";
const fs = require('fs');

const storage = multer.memoryStorage();

const upload = multer({ storage }); 

export default class ProductController {
  constructor(
    httpServer: HttpServer,
    createProductUseCase: CreateProductUseCase,
    updateProductUseCase: UpdateProductUseCase,
    deleteProductUseCase: DeleteProductUseCase,
    getAllProductUseCase: GetAllProductsUseCase,
    getProductByIdUseCase: GetProductByIdUseCase,
    uploadImageUseCase: UploadImageUseCase,
  ) {
    httpServer.register(
      "post",
      "/product",
      [jwtGuard, upload.single('image')],
      async (params: any, body: ProductDto, query: any, file: any) => {
        let urlImage = '';
        if(file){
          urlImage = await uploadImageUseCase.execute({ ...file  })
        }
        
        const response = await createProductUseCase.execute({ ...body, image: urlImage });
        return response;
      },
    );

    httpServer.register(
      "put",
      "/product",
      [jwtGuard, upload.single('image')],
      async (params: any, body: ProductDto, query: any, file: any) => {
        let urlImage = ''
        if(file){
          urlImage = await uploadImageUseCase.execute({ ...file  })

        }
        await updateProductUseCase.execute({ ...body, image: urlImage });
      },
    );

    httpServer.register(
      "delete",
      "/product/:productId",
      [jwtGuard],
      async (params: any, body: any) => {
        await deleteProductUseCase.execute(params.productId);
      },
    );

    httpServer.register(
      "get",
      "/products",
      [jwtGuard],
      async (params: any, body: any, query: any) => {
        return await getAllProductUseCase.execute(query);
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
