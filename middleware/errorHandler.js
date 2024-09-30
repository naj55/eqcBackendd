// middleware/errorHandler.js

const winston = require("winston"); // إضافة مكتبة تسجيل الأخطاء

// إعداد logger
const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log" }), // تسجيل الأخطاء في ملف
  ],
});

const errorHandler = (err, req, res, next) => {
  // تسجيل الخطأ
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
  // إعداد الرسالة العامة للأخطاء بناءً على بيئة التشغيل
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // إظهار stack trace في بيئة التطوير فقط
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
    // إضافة تفاصيل إضافية
    path: req.originalUrl, // مسار الطلب
    method: req.method, // طريقة الطلب
    timestamp: new Date().toISOString(), // توقيت الخطأ
  });
};

module.exports = errorHandler;
