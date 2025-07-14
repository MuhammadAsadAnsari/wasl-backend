const client = require("../helpers/mongodb");
const { ObjectId } = require("mongodb");
var _ = require("lodash");
const offsetlimit = require("../helpers/offset-limit");
const { error } = require("jquery");

module.exports = {
  createChat,
  getChatDetailsById,
  deleteChat,
  getChatMessages,
  insertchat,
  getchatId,
  validateConversation,
  getAllChats,
  admins,
};

async function createChat(req) {
  try {
    const foundAdmin = await client.db("wasl").collection("admin").findOne({});

    if (!foundAdmin) return { error: "Admin does not exist." };

    if (foundAdmin && req.auth.userid) {
      let chat = await client
        .db("wasl")
        .collection("chats")
        .findOne({
          members: {
            $all: [new ObjectId(req.auth.userid), foundAdmin?._id],
          },
        });

      if (chat) {
        //Chat already exists between the two users.
        return {
          message: "Cannot create a new chat. A chat already exists.",
          chat_id: chat._id,
        };
      } else {
        //Chat does not exist between the two users. Create a new chat.

        let newChat = await client
          .db("wasl")
          .collection("chats")
          .insertOne({
            members: [new ObjectId(req.auth.userid), foundAdmin?._id],
            t: new Date(),
          });

        const chat = {
          to: new ObjectId(req.auth.userid),
          from: foundAdmin?._id,
          message: "Hi, How may i help you?",
          chat_id: newChat?.insertedId,
          t: new Date(),
        };
        await client.db("wasl").collection("chat_messages").insertOne(chat);

        if (newChat.acknowledged) {
          return {
            chat,
          };
        } else {
          return {
            error: "Could not create a new chat.",
          };
        }
      }
    } else {
      return {
        error: "Could not create a new chat.",
      };
    }
  } catch (err) {
    console.log(err);

    return {
      error: "Could not create chat. Something went wrong.",
    };
  }
}

async function deleteChat(deletedby, chatid) {
  try {
    let currentUser = await client
      .db("wasl")
      .collection("chat_messages")
      .updateMany(
        { chat_id: chatid, deletedfor: { $ne: deletedby } },
        {
          $push: {
            deletedfor: deletedby,
          },
        }
      );

    if (currentUser) {
      return { chatdeleted: true };
    } else {
      return {
        error: "Could not create a new chat.",
      };
    }
  } catch (err) {
    console.log(err);

    return {
      error: "Could not create chat. Something went wrong.",
    };
  }
}

async function getChatDetailsById(profile_id, chat_id) {
  try {
    let chatDetail = await client
      .db("wasl")
      .collection("chats")
      .findOne({
        _id: ObjectId(chat_id),
      });

    if (chatDetail) {
      if (_.includes(chatDetail.members, profile_id)) {
        return chatDetail;
      } else {
        return {
          error: "To access a chat you need to be one of the members.",
        };
      }
    } else {
      return {
        error: "Requested chat does not exist.",
      };
    }
  } catch (err) {
    console.log(err);
    return {
      error: "Could not fetch chat details for the given chat.",
    };
  }
}

async function getChatMessages(chat_id, req) {
  console.log("🚀 ~ getChatMessages ~ chat_id:", chat_id);
  try {
    // var { offset, limit } = await offsetlimit(
    //   req.query.offset,
    //   req.query.limit
    // );
    let chatDetail = await client
      .db("wasl")
      .collection("chats")
      .findOne({
        _id: ObjectId(chat_id),
      });
    console.log(
      "🚀 ~ getChatMessages ~ chatDetail:",
      chatDetail,
      req.auth.userid,
      String(chatDetail.members[1]) === req.auth.userid ||
        String(chatDetail.members[0]) === req.auth.userid
    );

    if (chatDetail) {
      if (
        String(chatDetail.members[1]) === req.auth.userid ||
        String(chatDetail.members[0]) === req.auth.userid
      ) {
        let messages = await client
          .db("wasl")
          .collection("chat_messages")
          .aggregate([
            { $match: { chat_id: new ObjectId(chat_id) } },
            // {
            //   $lookup: {
            //     from: "admin", // collection to join (replace with your actual users collection name)
            //     localField: "from",
            //     foreignField: "_id",
            //     as: "from",
            //   },
            // },
            // {
            //   $lookup: {
            //     from: "users",
            //     localField: "to",
            //     foreignField: "_id",
            //     as: "to",
            //   },
            // },
            // {
            //   $unwind: { path: "$from", preserveNullAndEmptyArrays: true },
            // },
            // {
            //   $unwind: { path: "$to", preserveNullAndEmptyArrays: true },
            // },
            // Optional: sort, skip, limit
            // { $sort: { t: -1 } },
            // { $skip: offset },
            // { $limit: limit },
          ])
          .toArray();

        console.log("messages", messages);
        if (messages.length > 0) {
          return messages;
        } else {
          return [];
        }
      } else {
        return {
          error: "To access a chat you need to be one of the members.",
        };
      }
    } else {
      return {
        error: "Requested chat does not exist.",
      };
    }
  } catch (err) {
    console.log(err);
    return {
      error: "Could not fetch chat messages for the given chat.",
    };
  }
}

async function insertchat(chat) {
  try {
    let newChat = await client
      .db("wasl")
      .collection("chat_messages")
      .insertOne(chat);

    if (newChat.insertedCount > 0) {
      updateConversation(chat.chat_id);

      return {
        _id: newChat.insertedId,
      };
    } else {
      return {
        error: "Could not add new chat.",
      };
    }
  } catch (err) {
    console.log(err);

    return {
      error: "Could not create chat. Something went wrong.",
    };
  }
}

async function updateConversation(chatid) {
  let updated = await client
    .db("wasl")
    .collection("chats")
    .updateOne(
      {
        _id: ObjectId(chatid),
      },
      {
        $set: {
          t: new Date(),
        },
      },
      { upsert: false }
    );
}

async function getchatId(member1, member2) {
  try {
    let chatDetail = await client
      .db("wasl")
      .collection("chats")
      .findOne({
        members: { $all: [member1, member2] },
      });

    if (chatDetail) {
      return {
        _id: chatDetail._id,
      };
    } else {
      let newChat = await client
        .db("wasl")
        .collection("chats")
        .insertOne({
          members: [member1, member2],
          t: new Date(),
        });

      if (newChat.insertedCount > 0) {
        return {
          _id: newChat.insertedId,
        };
      } else {
        return {
          error: "Could not create a new chat.",
        };
      }
    }
  } catch (err) {
    console.log(err);
    return {
      error: "Could not fetch chat details for the given chat.",
    };
  }
}

async function validateConversation(from, to, chatId) {
  try {
    let chatDetail = await client
      .db("wasl")
      .collection("chats")
      .findOne({
        members: { $all: [from, to] },
      });

    if (chatDetail && chatDetail._id == chatId) {
      return {
        _id: chatDetail._id,
      };
    } else {
      return {
        error: "Could not fetch chat details for the given chat.",
      };
    }
  } catch (err) {
    console.log(err);
    return {
      error: "Could not fetch chat details for the given chat.",
    };
  }
}

async function admins(id) {
  try {
    //let admins = await client.db('wasl').collection('admin').find({}).project({active : 0, password :0}).toArray();

    let admins = await client
      .db("wasl")
      .collection("user")
      .aggregate([
        {
          $project: {
            active: 0,
            password: 0,
          },
        },
        {
          $addFields: {
            user_id: id,
          },
        },
        {
          $lookup: {
            from: "chats",
            localField: "user_id",
            foreignField: "members",
            as: "chat_details",
          },
        },
        {
          $unwind: {
            path: "$chat_details",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();
    if (admins) {
      return admins;
    } else {
      return [];
    }
  } catch (err) {
    return {
      error: "Could not fetch details.",
    };
  }
}

async function getAllChats(req, profile) {
  try {
    var { offset, limit } = await offsetlimit(
      req.query.offset,
      req.query.limit
    );
    console.log("req,user", req.auth.userid);
    let docs = await client
      .db("wasl")
      .collection("chats")
      .aggregate([
        {
          $lookup: {
            from: "chat_messages",
            localField: "_id",
            foreignField: "chat_id",
            as: "messages",
          },
        },
        // {
        //   $unwind: {
        //     path: "$messages",
        //   },
        // },
        {
          $sort: {
            "messages.t": -1,
          },
        },
        // {
        //   $group: {
        //     _id: "$_id",
        //     members: {
        //       $first: "$members",
        //     },
        //     count: {
        //       $sum: {
        //         $cond: {
        //           if: {
        //             $and: [
        //               {
        //                 $isArray: "$messages.deletedfor",
        //               },
        //               {
        //                 $in: [profile, "$messages.deletedfor"],
        //               },
        //             ],
        //           },
        //           then: 0,
        //           else: 1,
        //         },
        //       },
        //     },
        //     latest_msg: {
        //       $first: "$messages.message",
        //     },
        //     t: {
        //       $first: "$messages.t",
        //     },
        //   },
        // },
        // {
        //   $unwind: {
        //     path: "$members",
        //   },
        // },
        // {
        //   $project: {
        //     _id: {
        //       $toObjectId: "$_id",
        //     },
        //     members: {
        //       $toObjectId: "$members",
        //     },
        //     count: 1,
        //     latest_msg: 1,
        //     t: 1,
        //   },
        // },
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "members",
          },
        },
        // {
        //   $unwind: {
        //     path: "$members",
        //   },
        // },
        // {
        //   $project: {
        //     "members.app_settings": 0,
        //   },
        // },
        // {
        //   $group: {
        //     _id: "$_id",
        //     members: {
        //       $addToSet: "$members",
        //     },
        //     count: {
        //       $first: "$count",
        //     },
        //     latest_msg: {
        //       $first: "$latest_msg",
        //     },
        //     t: {
        //       $first: "$t",
        //     },
        //   },
        // },
        // {
        //   $sort: {
        //     t: -1,
        //   },
        // },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    if (docs.length > 0) {
      const foundUser = await client
        .db("wasl")
        .collection("users")
        .findOne({ _id: new ObjectId(req.auth.userid) });
        console.log("🚀 ~ getAllChats ~ foundUser:", foundUser)

      if (foundUser) {
        const checkDocs = docs.filter(
          (doc) => String(doc.members[0]?._id) === String(req.auth.userid)
        );
        console.log("🚀 ~ getAllChats ~ checkDocs:", checkDocs)
        if (checkDocs) return checkDocs;
        else return [];
      } else return docs;
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);
    return {
      error: "Could not fetch chats for the current user.",
    };
  }
}
