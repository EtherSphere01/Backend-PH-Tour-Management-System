import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/AppError";

export interface IInvoiceData {
    transactionId: string;
    bookingDate: Date;
    userName: string;
    tourTitle: string;
    guestCount: number;
    totalAmount: number;
}

const generatePDF = async (
    invoiceData: IInvoiceData
): Promise<Buffer<ArrayBufferLike>> => {
    try {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50,
            });
            const buffer: Uint8Array[] = [];
            doc.on("data", (chunk) => buffer.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffer)));
            doc.on("error", (err) => reject(err));

            // Colors
            const primaryColor = "#667eea";
            const secondaryColor = "#764ba2";
            const textColor = "#2c3e50";
            const lightGray = "#f8f9fa";
            const darkGray = "#495057";

            // Header with gradient background effect
            doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

            // Company Logo/Title
            doc.fontSize(28)
                .fillColor("white")
                .text("TOUR MANAGEMENT", 50, 30, { align: "left" })
                .fontSize(14)
                .text("Professional Travel Services", 50, 65);

            // Invoice title on the right
            doc.fontSize(24).text("INVOICE", 400, 40, { align: "right" });

            // Reset fill color for content
            doc.fillColor(textColor);

            // Invoice details section
            let yPosition = 150;

            // Transaction ID prominently displayed
            doc.fontSize(16)
                .fillColor(primaryColor)
                .text("Transaction ID:", 50, yPosition)
                .fontSize(18)
                .fillColor(textColor)
                .text(invoiceData.transactionId, 180, yPosition);

            yPosition += 40;

            // Date and Customer Info Section
            doc.fontSize(14)
                .fillColor(darkGray)
                .text("Invoice Date:", 50, yPosition)
                .text(
                    new Date(invoiceData.bookingDate).toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    ),
                    150,
                    yPosition
                );

            doc.text("Customer:", 350, yPosition)
                .fillColor(textColor)
                .fontSize(16)
                .text(invoiceData.userName, 420, yPosition);

            yPosition += 50;

            // Decorative line
            doc.moveTo(50, yPosition)
                .lineTo(doc.page.width - 50, yPosition)
                .strokeColor(primaryColor)
                .lineWidth(2)
                .stroke();

            yPosition += 30;

            // Tour Details Section
            doc.fontSize(18)
                .fillColor(primaryColor)
                .text("Tour Details", 50, yPosition);

            yPosition += 30;

            // Tour information box
            const boxY = yPosition;
            const boxHeight = 80;
            doc.rect(50, boxY, doc.page.width - 100, boxHeight)
                .fillAndStroke(lightGray, "#e9ecef")
                .lineWidth(1);

            doc.fontSize(16)
                .fillColor(textColor)
                .text("Tour Package:", 70, boxY + 15)
                .fontSize(14)
                .fillColor(darkGray)
                .text(invoiceData.tourTitle, 70, boxY + 35);

            doc.fontSize(14)
                .fillColor(textColor)
                .text(
                    `Number of Guests: ${invoiceData.guestCount}`,
                    70,
                    boxY + 55
                );

            yPosition += boxHeight + 40;

            // Payment Summary Section
            doc.fontSize(18)
                .fillColor(primaryColor)
                .text("Payment Summary", 50, yPosition);

            yPosition += 30;

            // Amount details
            const summaryBoxY = yPosition;
            const summaryBoxHeight = 120;

            // Background for summary
            doc.rect(
                50,
                summaryBoxY,
                doc.page.width - 100,
                summaryBoxHeight
            ).fill("#f8f9fa");

            // Amount breakdown
            doc.fontSize(14)
                .fillColor(darkGray)
                .text("Subtotal:", 70, summaryBoxY + 20)
                .text(
                    `$${invoiceData.totalAmount.toFixed(2)}`,
                    450,
                    summaryBoxY + 20,
                    { align: "right" }
                );

            doc.text("Service Fee:", 70, summaryBoxY + 40).text(
                "$0.00",
                450,
                summaryBoxY + 40,
                { align: "right" }
            );

            doc.text("Taxes:", 70, summaryBoxY + 60).text(
                "$0.00",
                450,
                summaryBoxY + 60,
                { align: "right" }
            );

            // Total amount (highlighted)
            doc.rect(50, summaryBoxY + 80, doc.page.width - 100, 40).fill(
                primaryColor
            );

            doc.fontSize(16)
                .fillColor("white")
                .text("Total Amount:", 70, summaryBoxY + 95)
                .fontSize(18)
                .text(
                    `$${invoiceData.totalAmount.toFixed(2)}`,
                    450,
                    summaryBoxY + 95,
                    { align: "right" }
                );

            yPosition += summaryBoxHeight + 50;

            // Payment Status
            doc.fontSize(16)
                .fillColor("#28a745")
                .text("✓ PAYMENT COMPLETED", 50, yPosition, {
                    align: "center",
                });

            yPosition += 40;

            // Thank you message
            doc.fontSize(14)
                .fillColor(textColor)
                .text(
                    "Thank you for choosing Tour Management System!",
                    50,
                    yPosition,
                    { align: "center" }
                )
                .fontSize(12)
                .fillColor(darkGray)
                .text(
                    "We hope you have an amazing travel experience.",
                    50,
                    yPosition + 20,
                    { align: "center" }
                );

            yPosition += 60;

            // Footer section
            const footerY = doc.page.height - 100;

            // Footer background
            doc.rect(0, footerY - 20, doc.page.width, 100).fill("#2c3e50");

            // Footer content
            doc.fontSize(10)
                .fillColor("white")
                .text(
                    "Tour Management System | Professional Travel Services",
                    50,
                    footerY,
                    { align: "center" }
                )
                .text(
                    "Email: support@tourmanagement.com | Phone: +1 (555) 123-4567",
                    50,
                    footerY + 15,
                    { align: "center" }
                )
                .text("Website: www.tourmanagement.com", 50, footerY + 30, {
                    align: "center",
                });

            // Decorative elements
            doc.circle(500, 180, 30).fillOpacity(0.1).fill(secondaryColor);

            doc.circle(520, 250, 20).fillOpacity(0.05).fill(primaryColor);

            doc.end();
        });
    } catch (error: any) {
        throw new AppError(401, `Failed to generate PDF ${error.message}`, "");
    }
};

export { generatePDF };
