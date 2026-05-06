const User = require("../models/User");
const Post = require("../models/Post");

const globalSearch = async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(200).json({ users: [], posts: [] });

    const usersPromise = User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("name username avatarUrl bio")
      .limit(10);

    const postsPromise = Post.find({
      $or: [
        { $text: { $search: q } },
        { tags: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    })
      .populate("author", "name username avatarUrl")
      .sort({ createdAt: -1 })
      .limit(20);

    const [users, posts] = await Promise.all([usersPromise, postsPromise]);
    return res.status(200).json({ users, posts });
  } catch (error) {
    return next(error);
  }
};

module.exports = { globalSearch };
