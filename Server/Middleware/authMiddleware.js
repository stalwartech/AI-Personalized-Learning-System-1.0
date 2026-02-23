const jwt = require("jsonwebtoken");
const authModel = require("../Model/authModel");

const authMiddleware = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify the token by _id

      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized token" });
      }

      user = await authModel.findById({ _id: decoded.id});
      console.log(user);
      req.user = user;
      next();
    } else {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = authMiddleware;