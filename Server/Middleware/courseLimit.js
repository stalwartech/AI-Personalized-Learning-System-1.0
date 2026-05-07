// Implementation of course Limit on a course 
// Step 1: Set the token to also have premium. 
// Step 2: Decode the token in the middleware.
// Step 3: If the user has generated more than two course throw an error that free users has reached its limit upgrade to premium 
// Step 4: Redirect to the payment page

const jwt = require("jsonwebtoken");
const authModel = require("../Model/authModel");

const courseMiddleware = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify the token by _id

      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized token" });
      }

      const user = await authModel.findById(decoded.premium);
      // console.log(user);
      req.user = user;
      req.userId = user.isPremium

      if(user.isPremium === true){
          next();
      }
      
    } else {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
      
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = courseMiddleware;