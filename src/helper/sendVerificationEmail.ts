import { resend } from "@/lib/resend";
import verificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendverificationEmail(
    email:string,
    username:string,
    verifyCode:string,
):Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Mystery Message Verification Code',
            react: verificationEmail({ username, otp: verifyCode }),
          });
        return {success:true,message:'Email sent successfully'}
    } catch (emailError) {
        console.log('Error sending verification email.',emailError)
        return {success:false,message:'Failed to send verification email'}
    }
}