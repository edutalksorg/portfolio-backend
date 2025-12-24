require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== Email Configuration Test ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL);
console.log('================================\n');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const mailOptions = {
    from: '"Test User (testuser@example.com)" <' + process.env.EMAIL_USER + '>',
    replyTo: 'testuser@example.com',
    to: process.env.RECIPIENT_EMAIL,
    subject: 'Test Email - Updated Display Name Format',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Test Email Configuration</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
                <p><strong>This is a test email to verify the recipient configuration.</strong></p>
                <p>If you receive this email, the configuration is working correctly.</p>
                <p><strong>Recipient Email:</strong> ${process.env.RECIPIENT_EMAIL}</p>
                <p><strong>Sender Email:</strong> ${process.env.EMAIL_USER}</p>
            </div>
        </div>
    `,
};

console.log('Sending test email to:', process.env.RECIPIENT_EMAIL);

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('❌ Error sending email:', error);
    } else {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    }
    process.exit(error ? 1 : 0);
});
