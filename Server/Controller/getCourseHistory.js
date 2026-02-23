const Course = require("../Model/courseMode");
const getCourseHistory = async (req, res) => {
    try{
        const {status, limit =20, skip=0} = req.query;

        const filter = {userId: req.userId}; // Get the user id
        if(status) filter.status = status; // This is to et the fileter status

    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ updatedAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip)).select('-lessons.content -lessons.notes'), 
      Course.countDocuments(filter)
    ]);

    return ({
        courses,
        pagination:{
            total,
            limit: parseInt(limit), // This is for pagination
            skip: parseInt(skip), // This is for pagination
            hasMore: total > parseInt(skip) + parseInt(limit) // This is for pagination
        }
    })
    }
    catch(error){
        console.log(error)
        return ("Error fetching course history")
    }
}

module.exports = getCourseHistory;