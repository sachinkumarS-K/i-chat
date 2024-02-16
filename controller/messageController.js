import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";

const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      return res.status(400).json({
        sucsess: false,
        message: "All fields are required",
      });
    }
    let message = await Message.create({
      sender: req.user.id,
      content,
      chat: chatId,
    });
    message = await message.populate("sender", "name , img");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name img email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    return res.status(200).json({
      sucsess: true,
      data: message,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      sucsess: false,
      message: error.message,
    });
  }
};
const allMessages = async (req, res) => {
  try {
    const messsages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name img email")
      .populate("chat");
    return res.status(200).json({
      sucsess: true,
      data: messsages,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      sucsess: false,
      message: error.message,
    });
  }
};

export { sendMessage, allMessages };
