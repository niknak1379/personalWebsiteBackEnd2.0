import express from "express";
import {
  validateLogin,
  updateRefreshToken,
  getRefreshToken,
} from "../database.js";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import google from "./passportGoogleOauth.js";
import logger from "../logger.js";
import passport from "passport";

const app = express.Router();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:80",
      "https://www.nikanostovan.dev",
      "https://nikanostovan.dev",
    ],
    credentials: true,
  })
);
app.use("/", google);
app.use(cookieParser());

//sends a json in the format {accessToken: value} if everything is valid
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    logger.info("incoming login request for email", {
      "email": email
    })
    let hash = await validateLogin(email);
    hash = hash.password;
    let validation = await bcrypt.compare(password, hash);
    if (validation) {
      logger.info("validation successfull")
      let accessToken = jwt.sign(
        { user: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      let { refreshToken } = await getRefreshToken(email);

      if (refreshToken == null) {
        logger.info("refresh token exists, renewing session")
        refreshToken = jwt.sign(
          { user: email },
          process.env.REFRESH_TOKEN_SECRET
        );
        updateRefreshToken(email, refreshToken);
      }

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 604800,
      });
      res.json({ accessToken: accessToken });
    } else {
      logger.info("validation unsuccessfull")
      res.status(401).send("wrong password");
    }
  } catch (e) {
    console.log(e);
    return;
  }
});

app.post("/logout", (req, res) => {
  logger.info("logout request")
  if (req.cookies.refreshToken == null) {

    logger.warn("no refresh token found")
    res.status(203).send("no refresh token to logout");
  }
  res.clearCookie("refreshToken", { httpOnly: true });
  logger.info("successfully logged out")
  res.send("successfully logged out");
});

// middleware function used to authenticate user on private API paths
// sends a status code 401 if the access token is not valid,
// which should redirect the user to seek a refresh token client side.
//
export function validateTokenMiddleware(req, res, next) {
  logger.debug("validation middleware being called")
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    res.status(401).send("token is null homie");
    return;
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      logger.error("error in verifying access token")
      res.status(401).send("refresh token");
      return;
    }
    logger.info("verified")
  });
  next();
}

//sends a json in the format {accessToken: value} if everything is valid
// and refreshes the token
app.post("/refresh", async (req, res) => {
  logger.info("refresh request incoming")
  let clientToken = req.cookies.refreshToken;
  if (clientToken == null) {
    logger.warn("no token found, user has to login again")
    res.status(403).send("please log in");
    return;
  }
  jwt.verify(clientToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      logger.warn("token found but could not verify")
      res.status(409).send("please login again");
      return;
    }
    logger.info("verified")
    let accessToken = jwt.sign(
      { user: req.params.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 60000 * 60 }
    );
    res.json({ accessToken: accessToken });
  });
});

app.get("/auth", validateTokenMiddleware, (req, res) => {
  logger.info("auth route done")
  res.send("authenticated");
});

export default app;
