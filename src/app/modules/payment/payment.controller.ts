import { Request, Response } from "express";
import { envVars } from "../../config/env";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { Payment } from "./payment.model";
import { PaymentService } from "./payment.service";

const initPayment = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId;
    const result = await PaymentService.initPayment(bookingId as string);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Payment done successfully",
        data: result,
    });
});
const successPayment = catchAsync(async (req: Request, res: Response) => {
    const paymentData = { ...req.query, ...req.body } as Record<string, string>;

    const result = await PaymentService.successPayment(paymentData);

    if (result.success) {
        res.redirect(
            `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${paymentData.transactionId}&message=${result.message}&amount=${paymentData.amount}&status=${paymentData.status}`
        );
    }
});
const failPayment = catchAsync(async (req: Request, res: Response) => {
    const paymentData = { ...req.query, ...req.body } as Record<string, string>;

    const result = await PaymentService.failPayment(paymentData);

    if (!result.success) {
        res.redirect(
            `${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${paymentData.transactionId}&message=${result.message}&amount=${paymentData.amount}&status=${paymentData.status}`
        );
    }
});
const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    const paymentData = { ...req.query, ...req.body } as Record<string, string>;

    const result = await PaymentService.cancelPayment(paymentData);

    if (!result.success) {
        res.redirect(
            `${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${paymentData.transactionId}&message=${result.message}&amount=${paymentData.amount}&status=${paymentData.status}`
        );
    }
});

const getInvoiceDownloadUrl = catchAsync(
    async (req: Request, res: Response) => {
        const { paymentId } = req.params;
        const result = await PaymentService.getInvoiceDownloadUrl(paymentId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Invoice download URL retrieved successfully",
            data: result,
        });
    }
);
const validatePayment = catchAsync(async (req: Request, res: Response) => {
    await SSLService.validatePayment(req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment Validated Successfully",
        data: null,
    });
});


const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId }).populate(
        "booking"
    );

    if (!payment) {
        sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "Payment not found",
            data: null,
        });
        return;
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment details retrieved",
        data: payment,
    });
});

export const PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl,
    validatePayment,
    getPaymentDetails,
};
