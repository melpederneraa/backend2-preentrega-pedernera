import { Router } from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import { userModel } from '../models/user.model.js'
import { generateToken } from '../utils/jwt.js'

const router = Router()

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body

        const userExists = await userModel.findOne({ email })

        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' })
        }

        const hashedPassword = bcrypt.hashSync(password, 10)

        const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            role: 'user'
        })

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            user: {
                id: newUser._id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role: newUser.role
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
        }

        const isValidPassword = bcrypt.compareSync(password, user.password)

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
        }

        const token = generateToken(user)

        res.cookie('authToken', token, {
            httpOnly: true,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production'
        })

        res.json({
            message: 'Login correcto',
            token
        })

    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message })
    }
})

router.get(
    '/current',
    passport.authenticate('current', { session: false }),
    async (req, res) => {
        res.json({
            message: 'Usuario autenticado',
            user: {
                id: req.user._id,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                email: req.user.email,
                role: req.user.role
            }
        })
    }
)

router.post('/logout', (req, res) => {
    res.clearCookie('authToken')
    res.json({ message: 'Logout correcto' })
})

export default router