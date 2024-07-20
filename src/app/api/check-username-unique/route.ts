import dbConnect from "@/lib/dbConnect";
import { z } from 'zod'
import userModel from "@/models/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {

    await dbConnect()
    try {
        //url example - localhost:3000/api/..?username=deev 
        const { searchParams } = new URL(request.url)

        const queryParam = {
            username: searchParams.get('username')
        }

        const result = usernameQuerySchema.safeParse(queryParam)
        console.log('Result:',result)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors.length > 0 ? usernameErrors.join(',') : 'Invalid query parameters'
            }, { status: 400 })
        }

        const {username} = result.data

        const existingUserVerified = await userModel.findOne({username,isVerified:true})

        if(existingUserVerified){
            return Response.json({
                success: false,
                message: 'Username is already taken',
            }, { status: 400 })
        }
        
        return Response.json({
            success: true,
            message: 'Username is unique.',
        }, { status: 201 })

    } catch (error) {
        console.error('Error checking username:', error)
        return Response.json({
            success: false,
            message: 'Error checking username',
        }, { status: 500 })
    }
}