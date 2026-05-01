import { Request, Response } from 'express';
export declare const orderController: {
    createOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getOrderByOrderId(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=orderController.d.ts.map