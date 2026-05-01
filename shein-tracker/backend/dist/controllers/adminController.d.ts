import { Request, Response } from 'express';
export declare const adminController: {
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllOrders(req: Request, res: Response): Promise<void>;
    updateOrderStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=adminController.d.ts.map