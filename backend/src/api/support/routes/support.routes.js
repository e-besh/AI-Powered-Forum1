import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { supportChatController } from "../controller/support.controller.js";

const router = express.Router();

router.post("/chat", authenticateUser, supportChatController);

export default router;
