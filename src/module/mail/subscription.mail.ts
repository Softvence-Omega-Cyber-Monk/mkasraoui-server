import { Injectable } from "@nestjs/common";
import { MailService } from "./mail.service";

@Injectable()
export class SubscriptionMailTemplatesService {
    // Note: The MailService dependency isn't needed here if this service only generates HTML.
    // However, if you plan to add sending logic later, keep it. I'll keep it for now.
    constructor(private mailService: MailService) {} 

    async generateSubscriptionActivatedHtml(
        userEmail: string,
        userName: string,
        planName: string,
        subscriptionId: string,
        startDate: Date, // <--- ADDED: Include the Date object as an argument
        intervalText: string,
    ): Promise<string> {
        
        // 1. Format the provided Date object
        const formattedStartDate = startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        
        // 2. Create the detailed HTML message (using the formatted date)
        const htmlContent = `
            <h1>🎉 Congratulations! Your Subscription is Active!</h1>
            <p>Hi ${userName},</p>
            <p>We're excited to confirm that your subscription to the <strong>${planName}${intervalText}</strong> is now active!</p>
            
            <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin: 20px 0;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Plan:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${planName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Subscription ID:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${subscriptionId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Start Date:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${formattedStartDate}</td>
                </tr>
            </table>

            <p>You can manage your subscription and billing information in your account dashboard.</p>
            <p>Thank you for subscribing!</p>
        `;

        // 3. CRITICAL FIX: Return the HTML string
        return htmlContent; 
    }
}