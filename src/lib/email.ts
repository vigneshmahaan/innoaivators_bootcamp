import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(toEmail: string, userName: string, courseName: string, batchName: string) {
  const mailOptions = {
    from: `"INNOAIVATORS TECH SOLUTION" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your Registration for ${courseName} is Verified! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0056b3; text-align: center;">INNOAIVATORS TECH SOLUTION</h2>
        <h3 style="text-align: center;">Registration Verified!</h3>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Congratulations! Your registration for <strong>${courseName}</strong> has been successfully verified.</p>
        <p>You have been officially assigned to:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;">
          ${batchName}
        </div>
        <p>We are thrilled to have you on board. You will receive another email shortly with your specific batch timings and the meeting link to join the sessions.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The INNOAIVATORS Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export async function sendMeetingLinkEmail(toEmail: string, userName: string, courseName: string, batchName: string, timing: string, meetingLink: string) {
  const mailOptions = {
    from: `"INNOAIVATORS TECH SOLUTION" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Important: Meeting Link & Timing for ${courseName} - ${batchName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0056b3; text-align: center;">INNOAIVATORS TECH SOLUTION</h2>
        <h3 style="text-align: center;">Batch Timings & Meeting Link</h3>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Here are your official batch details for <strong>${courseName}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f9f9f9;">Batch Name</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${batchName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Timing</td>
            <td style="padding: 10px; border: 1px solid #ddd; color: #d9534f; font-weight: bold;">${timing}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingLink}" target="_blank" style="background-color: #0056b3; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Join Class (Meeting Link)
          </a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #777;">Or copy and paste this link into your browser: <br/> <a href="${meetingLink}">${meetingLink}</a></p>

        <p>Please make sure to join exactly on time. We look forward to seeing you!</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The INNOAIVATORS Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Meeting link email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending meeting link email:', error);
    throw error;
  }
}

export async function sendFailedEmail(toEmail: string, userName: string, courseName: string) {
  const mailOptions = {
    from: `"INNOAIVATORS TECH SOLUTION" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Update on Your Registration for ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0056b3; text-align: center;">INNOAIVATORS TECH SOLUTION</h2>
        <h3 style="text-align: center; color: #c0392b;">Registration Payment Not Verified</h3>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Thank you for your interest in our <strong>${courseName}</strong> bootcamp.</p>
        <p>Unfortunately, we were <strong>unable to verify your payment</strong> for the registration. This could be because:</p>
        <ul style="line-height: 2;">
          <li>The payment screenshot provided was unclear or incomplete.</li>
          <li>The transaction amount did not match the required registration fee.</li>
          <li>The payment was not received in our account.</li>
        </ul>
        <div style="background-color: #fef9e7; border: 1px solid #f39c12; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>What to do next?</strong> Please reply to this email with a clear screenshot of your payment proof, and our team will re-verify it as soon as possible.</p>
        </div>
        <p>We apologize for any inconvenience and hope to resolve this for you quickly.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The INNOAIVATORS Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Failed email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending failed email:', error);
    throw error;
  }
}
