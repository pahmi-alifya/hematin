import { z } from 'zod'
import { isEmailPrefixBlocked, containsRestrictedWord } from './authGuard'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

// Sumber tunggal aturan validasi register — dipakai oleh form (registerFormSchema)
// maupun authStore.signUp() sebagai pertahanan kedua (defense in depth).
export const registerCoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 karakter')
    .max(50, 'Nama maksimal 50 karakter')
    .refine((v) => !containsRestrictedWord(v), 'Nama mengandung kata yang tidak diperbolehkan'),
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .refine(
      (v) => !isEmailPrefixBlocked(v) && !containsRestrictedWord(v),
      'Email ini sepertinya bukan email asli, coba pakai email lain',
    ),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})
export type RegisterCoreValues = z.infer<typeof registerCoreSchema>

export const registerFormSchema = registerCoreSchema
  .extend({
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak sama dengan konfirmasi',
    path: ['confirmPassword'],
  })
export type RegisterFormValues = z.infer<typeof registerFormSchema>
