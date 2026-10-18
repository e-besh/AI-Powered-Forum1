import { StatusCodes } from "http-status-codes";
import { generateSupportReply } from "../service/support.service.js";

// Validate a support message and return the assistant's reply.
export const supportChatController = async (req, res, next) => {
  try {
    const { message, messages = [] } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "A message is required.",
      });
    }

    if (message.trim().length > 1200) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Please keep support messages under 1200 characters.",
      });
    }

    const reply = await generateSupportReply({
      message: message.trim(),
      messages: Array.isArray(messages) ? messages : [],
      user: req.user,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
};
