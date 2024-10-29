import ProductRepository from "../../../infra/repositories/ProductRepository";

export default class GetProductByIdUseCase {
  productRepository?: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(productId: string) {
    return await this.productRepository?.getById(productId);
  }
}
