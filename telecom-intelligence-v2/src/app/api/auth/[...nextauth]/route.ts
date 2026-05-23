import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const users = [
          { id: '1', name: 'Mehrez ALOUI', username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, role: 'admin' },
          { id: '2', name: 'GUIRAT Mouna', username: process.env.USER_USERNAME, password: process.env.USER_PASSWORD, role: 'user' },
        ]
        const user = users.find(u => u.username === credentials?.username && u.password === credentials?.password)
        if (user) return { id: user.id, name: user.name, role: user.role }
        return null
      }
    })
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }