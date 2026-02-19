const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const sendWhatsAppMessage = async (toPhone, messageBody) => {
    try {
        // Ensure phone number has country code (default to +91 if missing)
        let formattedPhone = toPhone.trim();
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone;
        }

        const message = await client.messages.create({
            body: messageBody,
            from: fromPhone,
            to: `whatsapp:${formattedPhone}`
        });

        console.log(`[Twilio] Message sent to ${formattedPhone}: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('[Twilio Error]', error.message);
        return { success: false, error: error.message };
    }
};

const sendWhatsAppOTP = async (toPhone, otp) => {
    return await sendWhatsAppMessage(toPhone, `Your VahanPe verification code is: *${otp}*`);
};

module.exports = { sendWhatsAppOTP, sendWhatsAppMessage };
