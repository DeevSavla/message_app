import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import { User } from 'next-auth' //user that is returned from the providers.
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
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

    const userId = user._id

    const { acceptingMessage } = await request.json()

    try {
        const updatedUser = await userModel.findByIdAndUpdate(userId, { isAcceptingMessages: acceptingMessage }, { new: true })

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Unable to find user to update message acceptance status'
                },
                { status: 401 }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Message acceptance status updated',
                updatedUser
            },
            { status: 201 }
        );

    } catch (error) {
        return Response.json(
            {
                success: false,
                message: 'Failed to update user status to accept messages'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {

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

    const userId = user._id

    try {
        const foundUser = await userModel.findById(userId)
    
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: 'User not found'
                },
                { status: 404 }
            );
        }
    
        return Response.json(
            {
                success: true,
                isAcceptingMessages:foundUser.isAcceptingMessages
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: 'Error in getting message acceptance status'
            },
            { status: 500 }
        );
    }
}
