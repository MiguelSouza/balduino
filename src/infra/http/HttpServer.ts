import express, { Request, Response } from "express";
import cors from "cors";
import path from 'path';

export default interface HttpServer {
  listen(port: number): void;
  register(
    method: string,
    url: string,
    middlewares: Array<Function>,
    callback: Function,
  ): void;
}

export default class ExpressAdapter implements HttpServer {
  app: any;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(cors({
      origin: ['https://d3ak7yebchpp7t.cloudfront.net'],
      credentials: true,
    }));
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  }

  register(
    method: string,
    url: string,
    middlewares: Array<Function>,
    callback: Function,
  ): void {
    this.app[method](
      url,
      ...middlewares,
      async function (req: Request, res: Response) {
        const output = await callback(req.params, req.body, req.query, req.file, res);
        res.json(output);
      },
    );
  }

  listen(port: number): void {
    this.app.listen(port);
    console.log(`Ambiente rodando na porta ${port}`);
  }
}
