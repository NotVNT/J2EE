export const validateEmail = (email) => {
  if (!email.trim()) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
