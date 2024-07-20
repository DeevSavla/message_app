import dbConnect from "@/lib/dbConnect";
import { z } from 'zod'
import userModel from "@/models/User.model";
import { verifySchema } from "@/schemas/verifySchema";

const verifyCodeSchema = z.object({
    code: verifySchema
})

export async function POST(request: Request) {
    await dbConnect()
    try {

        const { username, code } = await request.json()

        const queryParam={
            code,
        }

        const result = verifyCodeSchema.safeParse(queryParam)
        console.log('Result:',result)

        if (!result.success) {
            const verifyCodeErrors = result.error.format().code?._errors || []
            return Response.json({
                success: false,
                message: verifyCodeErrors.length > 0 ? verifyCodeErrors.join(',') : 'Invalid query parameters'
            }, { status: 400 })
        }

        const user = await userModel.findOne({ username })

        if (!user) {
            return Response.json({
                success: false,
                message: 'User not Found',
            }, { status: 400 })
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()
            return Response.json({
                success: true,
                message: 'Account verified successfully',
            }, { status: 200 })
        }

        else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: 'Verification code has expired please signup again',
            }, { status: 400 })
        }

        else {
            return Response.json({
                success: false,
                message: 'Code is Incorrect',
            }, { status: 400 })
        }

    } catch (error) {
        console.error('Error while verifying OTP:', error)
        return Response.json({
            success: false,
            message: 'Error while verifying OTP',
        }, { status: 500 })
    }
}