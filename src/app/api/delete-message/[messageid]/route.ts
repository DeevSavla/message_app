import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {

    const messageId = params.messageid

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

    try {
        const updateUser = await userModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageId } } }
        )

        if (updateUser.modifiedCount == 0) {
            return Response.json(
                {
                    success: false,
                    message: 'Message not found or already deleted'
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Message Deleted'
            },
            { status: 200 }
        );

    } catch (error) {
        return Response.json(
            {
                success: false,
                message: 'Error while deleting message'
            },
            { status: 500 }
        );
    }
}