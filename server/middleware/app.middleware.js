import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const setupMiddleware = (app) => {

  // Read origins from Render env variables
  const configuredOrigins = (
    process.env.CORS_ORIGIN ||
    process.env.CLIENT_URL ||
    ""
  )
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

  // Development defaults
  const allowedOrigins =
    configuredOrigins.length > 0
      ? configuredOrigins
      : [
          "http://localhost:3000",
          "http://127.0.0.1:3000"
        ];

  console.log("✅ Allowed Origins:");
  console.log(allowedOrigins);

  app.use(
    cors({
      origin: function (origin, callback) {
        console.log("Incoming Origin:", origin);

        // Allow Postman/mobile apps/no origin
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.log("❌ Blocked Origin:", origin);

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },

      credentials: true,

      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ],

      allowedHeaders: [
        "Content-Type",
        "Authorization",
      ],
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });

  console.log("✅ Middleware Loaded");
};