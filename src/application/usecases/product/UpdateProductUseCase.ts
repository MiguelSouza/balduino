import ProductDto from "../../../infra/controllers/product/dto/ProductDto";
import Product from "../../../infra/domain/Product";
import ProductRepository from "../../../infra/repositories/ProductRepository";

export default class UpdateProductUseCase {
  productRepository?: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(product: ProductDto): Promise<void> {
    const oldProduct = await this.productRepository?.getById(product.productId);
    const newProduct = new Product(oldProduct as Product);
    newProduct.update({
      name: product.name,
      value: product.value,
      active: product.active,
      image: product.image,
    });
    await this.productRepository?.update(newProduct);
  }
}
