import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import bcrypt from 'bcryptjs'
import { sendverificationEmail } from "@/helper/sendVerificationEmail";

export async function POST(request:Request){
    await dbConnect()

    try {
        const {username,email,password} = await request.json()

        const existingUserVerifiedUsername = await userModel.findOne({username,isVerified:true})

        if(existingUserVerifiedUsername)
        {
            return Response.json({
                success:false,
                message:'User is already taken'
            },{status:400})
        }

        const existingUserEmail = await userModel.findOne({email,isVerified:true})

        const verifyCode = Math.floor(100000 + Math.random()*900000).toString()

        if(existingUserEmail)
        {
            if(existingUserEmail.isVerified)
            {
                return Response.json({
                    success:false,
                    message:'User already exists with this email.'
                },{status:400})
            } 
            else 
            {
                const hashedPassword = await bcrypt.hash(password,10)
                existingUserEmail.password = hashedPassword
                existingUserEmail.verifyCode = verifyCode
                existingUserEmail.verifyCodeExpiry = new Date(Date.now()+3600000)
                await existingUserEmail.save()
            }
        } 
        else 
        {
            const hashedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours()+1)
            const newUser = new userModel(
                {
                    username,
                    email,
                    password:hashedPassword,
                    verifyCode,
                    verifyCodeExpiry:expiryDate,
                    isVerified: false,
                    isAcceptingMessages: true,
                    messages: [],
                }
            )
            await newUser.save()
        }

        const emailResponse = await sendverificationEmail(email,username,verifyCode)

        if(!emailResponse.success)
        {
            return Response.json({
            success:false,
            message:emailResponse.message
            },{status:500})
        }

        return Response.json({
            success:true,
            message:'User registered successfully. Please verify your email.'
        },{status:201})

    } catch (error) {
        console.error('Error registering user',error)
        return Response.json({
            success:false,
            message:'Error registering user'
        },{status:500})
    }
}