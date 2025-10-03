import { API_BASE_URL } from "@/src/constants";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient, lastLoginMethodClient, phoneNumberClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: API_BASE_URL, // Base URL of your Better Auth backend.
    plugins: [
        expoClient({
            scheme: "rendercondemo2025",
            storagePrefix: "rendercondemo2025",
            storage: SecureStore,
        }),
        twoFactorClient(),
        phoneNumberClient(),
        emailOTPClient(),
        lastLoginMethodClient(),
    ]
});