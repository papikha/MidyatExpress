import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    message: "Çok fazla istek attın, lütfen daha sonra dene"
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default rateLimiter;
