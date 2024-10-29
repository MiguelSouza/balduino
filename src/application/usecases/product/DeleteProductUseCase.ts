import ProductRepository from "../../../infra/repositories/ProductRepository";

export default class DeleteProductUseCase {
  productRepository?: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(productId: string) {
    this.productRepository?.delete(productId);
  }
}
