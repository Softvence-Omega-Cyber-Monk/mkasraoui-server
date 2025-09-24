import { Injectable } from '@nestjs/common';

@Injectable()
export class PromotionalMailTemplatesService {
  async getInvitationTemplate(subject:string, message: string): Promise<string> {
 const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
              .header { background-color: #007bff; color: #ffffff; padding: 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 20px; text-align: center; }
              .content h2 { color: #333333; font-size: 20px; }
              .content p { color: #666666; font-size: 16px; line-height: 1.6; }
              .cta-button { display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
              .footer { background-color: #f8f9fa; color: #6c757d; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #e9ecef; }
              .footer a { color: #6c757d; text-decoration: underline; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${subject}</h1>
              </div>
              <div class="content">
                  <p style="font-size: 18px; color: #fff8f8ff;"><strong>${subject}</strong></p>
                  <p>${message}</p>
                  <a href="https://yourwebsite.com/promo" class="cta-button">Claim Your Offer Now</a>
              </div>
              <div class="footer">
                  <p>You received this email because you are a valued subscriber to our newsletter. If you no longer wish to receive these emails, you can <a href="#">unsubscribe here</a>.</p>
                  <p>Your Company Name | 1234 Business Ave, Suite 100, City, State, ZIP</p>
              </div>
          </div>
      </body>
      </html>
      `; 
    return html;
  }
}
