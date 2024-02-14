import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

async function accessChat(req, res) {
  try {
    const { userId } = req.body;
    console.log(userId);
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "UserId not found",
      });
    }

    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user.id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      return res.status(200).json({
        success: true,
        data: isChat[0],
      });
    }

    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");

      res.status(200).json({
        success: true,
        data: fullChat,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

const fetchChats = async (req, res) => {
  try {
    let chat = await Chat.find({
      users: { $elemMatch: { $eq: req.user.id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ isGroupChat: -1 });

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.send(chat);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createGroupChat = async (req, res) => {
  try {
    const { users, name } = req.body;

    if (!users || !name) {
      res.status(400).json({
        success: false,
        message: "please fill all fields",
      });
    }

    let user = JSON.parse(users);
    if (user.length < 2) {
      return res.status(400).json({
        success: false,
        message: "More than 2 user are required to create group",
      });
    }

    user.push(req.user.id);

    const groupChat = await Chat.create({
      chatName: name,
      users: user,
      isGroupChat: true,
      groupAdmin: req.user.id,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.send(fullGroupChat);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(400).json({
        success: false,
        message: "group not found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const newGroup = await Chat.findByIdAndUpdate(chatId, {
      $push: { users: userId },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!newGroup) {
      return res.status(400).json({
        success: true,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: newGroup,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const newGroup = await Chat.findByIdAndUpdate(chatId, {
      $pull: { users: userId },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!newGroup) {
      return res.status(400).json({
        success: true,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: newGroup,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
