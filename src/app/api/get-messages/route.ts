import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
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

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const result = await userModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            {
                $group: {
                    _id: '$_id',
                    messages: { $push: '$messages' }
                }
            }
        ]);

        if (result.length === 0 || !result[0].messages) {
            return Response.json(
                {
                    success: true,
                    messages: []
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: true,
                messages: result[0].messages
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error while getting messages:", error);
        return Response.json(
            {
                success: false,
                message: 'Error while getting messages'
            },
            { status: 500 }
        );
    }
}
