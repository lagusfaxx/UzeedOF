import express from "express";
import cors from "cors";
import session from "express-session";
import rateLimit from "express-rate-limit";
import pgSession from "connect-pg-simple";
import { env } from "./lib/env";
import { pool } from "./lib/pg";
import { attachUser } from "./middleware/attachUser";
import { authRouter } from "./routes/auth";
import { meRouter } from "./routes/me";
import { postsRouter } from "./routes/posts";
import { adminRouter } from "./routes/admin";
import { billingRouter } from "./routes/billing";
import { startCron } from "./lib/cron";

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: env.WEB_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "2mb" }));

const PgSession = pgSession(session);

app.use(
  session({
    name: "uzeed.sid",
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30
    },
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true
    })
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(attachUser);
app.use(authRouter);
app.use(meRouter);
app.use(postsRouter);
app.use(adminRouter);
app.use(billingRouter);

startCron();

app.listen(env.PORT, () => {
  console.log(`API listening on :${env.PORT}`);
});