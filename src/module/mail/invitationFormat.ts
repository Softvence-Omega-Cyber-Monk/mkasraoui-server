import { Injectable } from '@nestjs/common';

@Injectable()
export class MailTemplatesService {
    // 💡 Renamed invitationToken to imageSource for clarity and flexibility
    async getInvitationTemplate(imageSource: string, confirmationLink: string): Promise<string> {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited!</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: 'Inter', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px; background-color: #556080; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600;">You're Invited!</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <img src="${imageSource}" alt="Invitation Image" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto; border: 1px solid #e0e0e0;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 20px 40px 30px; text-align: center;">
                            <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 24px;">
                                We are excited to invite you to our event. Please click the button below to confirm your invitation and get all the details.
                            </p>
                            
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background-color: #556080; padding: 12px 24px;">
                                        <a href="${confirmationLink}" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                                            Confirm My Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; color: #888888; margin-top: 30px;">This link will expire in 1 hour.</p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px; font-size: 12px; color: #aaaaaa; background-color: #f9f9f9; border-top: 1px solid #e0e0e0;">
                            © 2024 MA FATE FACILE. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>
`;
        
        return htmlContent;
    }


    async getProviderApprovalTemplate(userName: string): Promise<string> {
// ... (The rest of this method remains unchanged)
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Provider Approved</title>
<style>
  body { margin:0; padding:0; font-family:Arial, sans-serif; background-color:#fef6f9; }
  .container { width:100%; padding:20px; }
  .email-card { max-width:650px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #f0f0f0; }
  .header { background:#f67280; padding:40px 20px; text-align:center; color:#fff; }
  .header h1 { margin:0; font-size:28px; }
  .content { padding:30px 20px; text-align:center; color:#333; }
  .content p { font-size:16px; margin-bottom:20px; }
  .btn { display:inline-block; background-color:#c06c84; color:#fff; padding:12px 24px; text-decoration:none; font-weight:bold; border-radius:8px; }
  .footer { font-size:12px; color:#888; text-align:center; padding:20px; background:#f9f9f9; }
  .balloons { margin:20px 0; }
  .balloons img { width:60px; margin:0 5px; }
</style>
</head>
<body>
  <div class="container">
    <div class="email-card">
      <div class="header">
        <h1>🎉 You're Approved! 🎉</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Congratulations! Your request to become a <strong>Provider</strong> has been approved by our admin team.</p>
        <p>Please login again to access to all provider features. </p>

        <p>We’re thrilled to celebrate this moment with you!</p>
      </div>
      <div class="footer">© 2025 MA FATE FACILE
. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`;
    }
}