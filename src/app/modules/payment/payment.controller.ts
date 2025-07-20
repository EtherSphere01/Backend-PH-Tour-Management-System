import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";

const initPayment = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId;
    const result = await paymentService.initPayment(bookingId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment initialized successfully",
        data: result,
    });
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await paymentService.successPayment(query);

    if (result.success) {
        res.redirect(
            `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&${query.status}`
        );
    }
});
const failPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await paymentService.failPayment(query);

    if (!result.success) {
        res.redirect(
            `${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&${query.status}`
        );
    }
});
const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await paymentService.cancelPayment(query);

    if (!result.success) {
        res.redirect(
            `${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&${query.status}`
        );
    }
});

export const PaymentController = {
    successPayment,
    failPayment,
    cancelPayment,
    initPayment,
};
