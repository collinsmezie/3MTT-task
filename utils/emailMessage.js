const emailMessage = (userName, otp) => {
    return `Hi ${userName}, ${otp} is your dashboard access OTP. Do not share with anyone`
}

module.exports = emailMessage;
