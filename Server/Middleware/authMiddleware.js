const authModel = require("../Model/authModel");
const authMiddleware = async (req, res, next) => {
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = await authModel.findOne({id: decoded._id});
            next();
        } catch (error) {
            console.log(error.message);
            return res.status(401).json({message: "Not authorized, token is failed"})
        }}}
    
        module.exports = authMiddleware