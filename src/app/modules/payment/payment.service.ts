import { Request, Response } from "express";
import { Booking } from "../booking/booking.model";
import { Payment } from "./payment.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { BOOKING_STATUS } from "../booking/booking.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { generatePDF, IInvoiceData } from "../../utils/invoice";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { sendEmail } from "../../utils/sendEmail";

const initPayment = async (bookingId: string) => {
    const payment = await Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Payment not found for the booking",
            ""
        );
    }

    const booking = await Booking.findById(bookingId);

    const userAddress = (booking?.user as any).address;
    const userEmail = (booking?.user as any).email;
    const userPhoneNumber = (booking?.user as any).phone;
    const userName = (booking?.user as any).name;

    const sslPayload: ISSLCommerz = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageURL,
    };
};

const successPayment = async (query: Record<string, string>) => {
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },

            {
                status: PAYMENT_STATUS.PAID,
            },
            { session }
        );

        const updatedBooking = await Booking.findOneAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.COMPLETE },
            { new: true, runValidators: true, session }
        )
            .populate("tour", "title")
            .populate("user", "name", "email");

        if (!updatedBooking) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Booking not found for the payment",
                ""
            );
        }
        const invoiceData: IInvoiceData = {
            bookingDate: updatedBooking?.createdAt || new Date(),
            guestCount: updatedBooking?.guestCount || 0,
            totalAmount: updatedPayment?.amount || 0,
            tourTitle:
                (updatedBooking?.tour as unknown as ITour).title ||
                "Unknown Tour",
            transactionId: updatedPayment?.transactionId || "N/A",
            userName:
                (updatedBooking?.user as unknown as IUser).name ||
                "Unknown User",
        };

        const pdfBuffer = await generatePDF(invoiceData);

        await sendEmail({
            to: (updatedBooking?.user as unknown as IUser).email,
            subject: "Payment Successful - Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: `invoice-${invoiceData.transactionId}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        });

        await session.commitTransaction();
        session.endSession();
        return {
            success: true,
            message: "Payment successful",
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const cancelPayment = async (query: Record<string, string>) => {
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },

            {
                status: PAYMENT_STATUS.CANCELLED,
            },
            { session }
        );

        const updatedBooking = await Booking.findOneAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.CANCEL },
            { runValidators: true, session }
        );

        await session.commitTransaction();
        session.endSession();
        return {
            success: false,
            message: "Payment Cancelled",
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
const failPayment = async (query: Record<string, string>) => {
    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },

            {
                status: PAYMENT_STATUS.FAILED,
            },
            { session }
        );

        const updatedBooking = await Booking.findOneAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.FAILED },
            { runValidators: true, session }
        );

        await session.commitTransaction();
        session.endSession();
        return {
            success: false,
            message: "Payment failed",
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const paymentService = {
    successPayment,
    failPayment,
    cancelPayment,
    initPayment,
};
