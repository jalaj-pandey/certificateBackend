
import { User } from "../model/user";
import ErrorHandler from "../types/utility-classes";
import { TryCatch } from "./error";



//Middleware to make sure only admin is allowed
export const adminOnly = TryCatch(async(req, res, next) => {
    const { id } = req.query;
    if(!id) return next(new ErrorHandler("Login first", 401));

    const user = await User.findById(id);

    if(!user) return next(new ErrorHandler("Id does not exist", 401));
    if(user.role !== "admin") return next(new ErrorHandler("User is not an admin", 401));

    next();

});