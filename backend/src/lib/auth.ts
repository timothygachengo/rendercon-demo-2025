import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { twoFactor, phoneNumber, magicLink, emailOTP, bearer, lastLoginMethod, multiSession, openAPI } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { expoPasskey } from "expo-passkey/server";
import * as schema from '@/db/auth.schema';

const trustedOrigins = [
    "rendercondemo2025://",
    "http://localhost:8081"
]

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
          ...schema
        }
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    trustedOrigins,
    session: {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    plugins: [
        expo(),
        twoFactor(),
        phoneNumber({
            sendOTP: async ({ phoneNumber, code }) => {
                // Implement your SMS sending logic here
                console.log(`Send OTP to ${phoneNumber}: ${code}`);
            },
            otpLength: 6,
        }),
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                // Implement your email sending logic here
                console.log(`Send magic link to ${email}: ${url}`);
            }
        }),
        emailOTP({
            sendVerificationOTP: async ({ email, otp, type }) => {
                // Implement your email sending logic here
                console.log(`Send ${type} OTP to ${email}: ${otp}`);
            },
            overrideDefaultEmailVerification: true
        }),
        bearer(),
        lastLoginMethod({
            storeInDatabase: true
        }),
        multiSession({
            maximumSessions: 5
        }),
        openAPI(),
        expoPasskey({
            rpId: "example.com",
            rpName: "RenderCon Demo",
            origin: [
                "https://example.com", // Your website
                "android:apk-key-hash:--fSTrw19MLvyJ1myCJjnc7kbclf_b_dB4raOx2onUU" // Android app signature
            ]
        })
    ]
});
