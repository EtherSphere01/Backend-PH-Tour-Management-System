import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { OtpService } from "./otp.service";

const sendOtp = async (req: Request, res: Response) => {
    await OtpService.sendOtp(req.body.email, req.body.name);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "OTP sent successfully",
        data: null,
    });
};

const verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await OtpService.verifyOtp(email, otp);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "OTP verified successfully",
        data: null,
    });
};

export const OtpController = {
    sendOtp,
    verifyOtp,
};
