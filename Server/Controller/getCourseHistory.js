const Course = require("../Model/courseMode");
const getCourseHistory = async (req, res) => {
    try{
        const {status, limit =20, skip=0} = req.query;

        const filter = {userId: req.userId};
        if(status) filter.status = status;

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('-lessons.content -lessons.notes'), // skip heavy fields in list view
      Course.countDocuments(filter)
    ]);

    return ({
        courses,
        pagination:{
            total,
            limit: parseInt(limit),
            skip: parseInt(skip),
            hasMore: total > parseInt(skip) + parseInt(limit)
        }
    })
    }
    catch(error){
        console.log(error)
        return ("Error fetching course history")
    }
}

module.exports = getCourseHistory;