import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import mongoose from "mongoose";

export async function GET(request:Request){
    await dbConnect()

    const session = await getServerSession(authOptions)

    const user = session?.user;

    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: 'Not authenticated'
            },
            { status: 401 }
        );
    }

    //converted from string to object to prevent error during backend aggregation pipeline.
    const userId = new mongoose.Types.ObjectId(user._id) 

    try {
        const user = await userModel.aggregate([
            {
                $match:{_id:userId}
            },
            {
                $unwind:'$messages'
            },
            {
                $sort:{
                    'messages.createdAt':-1
                }
            },
            {
                $group:{_id:'$_id',messages:{
                    $push:'$messages'
                }}
            }
        ])

        if(!user || user.length===0){
            return Response.json(
                {
                    success: false,
                    message: 'User not found'
                },
                { status: 401 }
            );
        }

        return Response.json(
            {
                success: true,
                messages:user[0].messages
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
                success: false,
                message:'Error while getting messages'
            },
            { status: 500 }
        );
    }
}