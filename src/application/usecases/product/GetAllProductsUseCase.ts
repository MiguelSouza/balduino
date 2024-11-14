import ProductRepository from "../../../infra/repositories/ProductRepository";

export default class GetAllProductsUseCase {
  productRepository?: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(query: any) {
    return await this.productRepository?.getAll(query);
  }
}
