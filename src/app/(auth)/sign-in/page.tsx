'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from "react"
import { useDebounceValue } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signupSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"

function page() {
  const { toast } = useToast()
  const router = useRouter()

  const [username,setUsername] = useState('')
  const [usernameMessage,setUsernameMessage] = useState('')
  const [isCheckingUsername,setIsCheckingUsername] = useState(false)
  const [isSubmit,setIsSubmit] = useState(false)
  const debouncedUsername = useDebounceValue(username,300)

  //zod
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver:zodResolver(signupSchema),
    defaultValues:{
      username:'',
      email:'',
      password:''
    }
  })

  useEffect(()=>{
    const checkUsernameUnique = async ()=>{
      if(debouncedUsername){
        setIsCheckingUsername(true)
        setUsernameMessage('')

        try {
          const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`)
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? 'Error checking username')
        } finally{
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()

  },[debouncedUsername])

  const onSubmit = async (data:z.infer<typeof signupSchema>) =>{
    console.log(data)
    setIsSubmit(true)
    try {
      const response = await axios.post<ApiResponse>('/api/signup',data)
      toast({
        title:'Success',
        description:response.data.message,
      })
      router.replace(`/verify/${username}`)
      setIsSubmit(false)
    } catch (error) {
      console.error('Error in signup of user',error)
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message
      toast({
        title:'Signup failed',
        description:errorMessage,
        variant:'destructive'
      })
      setIsSubmit(false)
    }
  }

  return (
    <div>page</div>
  )
}

export default page