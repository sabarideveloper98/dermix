/**
 * Generate a random 6-digit numeric OTP.
 * @returns {string}
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
