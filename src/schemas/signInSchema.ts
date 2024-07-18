import {z} from 'zod'

export const verifySchema = z.object({
    identifier : z.string(), //better word for username/email
    password:z.string()
})