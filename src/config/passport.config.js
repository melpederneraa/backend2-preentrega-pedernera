import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { userModel } from '../models/user.model.js'

const cookieExtractor = (req) => {
    let token = null

    if (req && req.cookies) {
        token = req.cookies['authToken']
    }

    return token
}

export const initializePassport = () => {

    passport.use(
        'current',
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
                secretOrKey: process.env.JWT_SECRET
            },

            async (jwt_payload, done) => {

                try {

                    const user = await userModel.findById(jwt_payload.userId)

                    if (!user) {
                        return done(null, false)
                    }

                    return done(null, user)

                } catch (error) {

                    return done(error, false)
                }
            }
        )
    )
}