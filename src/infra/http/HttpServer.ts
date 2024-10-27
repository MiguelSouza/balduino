import express, { Request, Response } from "express";
import cors from "cors";

export default interface HttpServer {
  listen(port: number): void;
  register(method: string, url: string, callback: Function): void;
}

export default class ExpressAdapter implements HttpServer {
  app: any;

  constructor() {
    this.app = express();
    this.app.use(express.json())
    this.app.use(cors());
  }

  register(method: string, url: string, callback: Function): void {
    this.app[method](url, async function (req: Request, res: Response) {
        const output = await callback(req.params, req.body);
        res.json(output);
    });
  }

  listen(port: number): void {
    this.app.listen(port);
    console.log(`Ambiente rodando na porta ${port}`);
  }
}
