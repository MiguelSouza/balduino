import IProductRepository from "../../application/repositories/ProductRepository";
import DatabaseConnection from "../database/DatabaseConnection";
import Product from "../domain/Product";

export default class ProductRepository implements IProductRepository {
  connection?: DatabaseConnection;

  constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  async save(product: Product): Promise<Product> {
    return this.connection?.query(
      "insert into balduino.product (product_id, name, value, image, active, editable, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        product.productId,
        product.name,
        product.value,
        product.image,
        true,
        product.editable,
        product.createdAt,
        product.updatedAt,
      ],
    );
  }

  async update(product: Product): Promise<void> {
    await this.connection?.query(
      `UPDATE balduino.product
            SET name = $1, value = $2, image = $3, active = $4, editable = $5, updated_at = $6 
            WHERE product_id = $7`,
      [
        product.name,
        product.value,
        product.image,
        product.active,
        product.editable,
        new Date(),
        product.productId,
      ],
    );
  }

  async getByName(name: string): Promise<Product> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.product WHERE table_id like '%$1%'",
      [name],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getById(productId: string): Promise<Product> {
    const result = await this.connection?.query(
      "SELECT * FROM balduino.product WHERE product_id = $1",
      [productId],
    );
    return result.length > 0 ? result[0] : null;
  }

  async getAll(query: any): Promise<Product[]> {
    return this.connection?.query(`
        SELECT 
            p.product_id,
            p.name,
            p.value,
            p.image,
            p.active,
            p.type,
            p.created_at,
            p.updated_at,
            p.editable,
            COALESCE(SUM(CASE WHEN o.status = 'paid' THEN op.quantity ELSE 0 END), 0) AS total_vendido
        FROM 
            balduino.product p
        LEFT JOIN 
            balduino.order_product op ON p.product_id = op.product_id
        LEFT JOIN 
            balduino.order o ON o.order_id = op.order_id
        WHERE p.type = 'common'
        GROUP BY 
            p.product_id, p.name, p.value, p.image, p.active, p.created_at, p.updated_at, p.editable
        ORDER BY 
            total_vendido DESC;
      `, null);
  }

  async delete(productId: string): Promise<void> {
    this.connection?.query(
      "delete from balduino.product where product_id = $1",
      [productId],
    );
  }
}
