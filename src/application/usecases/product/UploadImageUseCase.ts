import cloudinary from "../../../cloudinaryConfig";
import { v4 as uuid } from "uuid";

export default class UploadImageUseCase {

  constructor() {}

  async execute(image: any): Promise<string> {
    
    if (!image || !image.buffer) {
      throw new Error('Imagem não recebida ou inválida');
    }

    
    return new Promise((resolve, reject) => {
      const result = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          public_id: uuid(),
          resource_type: 'image',
        },
        (error: any, result: any) => {
          if (error) {
            return reject(error);
          }
          resolve(result?.secure_url); 
        }
      );

      result.end(image.buffer);
    });
  }
}
