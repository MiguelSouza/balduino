import CreateResponseDto from "../../../infra/controllers/product/dto/CreateResponseDto";
import ProductDto from "../../../infra/controllers/product/dto/ProductDto";
import Product from "../../../infra/domain/Product";
import ProductRepository from "../../../infra/repositories/ProductRepository";

export default class CreateProductUseCase {
  productRepository?: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(product: ProductDto): Promise<CreateResponseDto> {
    try {
      const productEntity = new Product({
        name: product.name,
        active: product.active,
        value: product.value,
        image: product.image,
      });
      const response = await this.productRepository?.save(productEntity);
      return {
        product: response,
      };
    } catch (err: any) {
      return {
        product: undefined,
        errorMessage: err.message,
      };
    }
  }
}
