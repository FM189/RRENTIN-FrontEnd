"use server"

import { cookies } from "next/headers";

export async function getAccessToken() {
    try {
        const cookiesStore = await cookies();
        const cookieName = process.env.COOKIE_NAME || "next-auth.session-token";
        const sessionToken = cookiesStore.get(cookieName);
        
        if (!sessionToken) {
            return null;
        }

        // Return the raw JWT token string (what you send to backend)
        return sessionToken.value;
    } catch (error) {
        console.error("Error getting access token:", error);
        return null;
    }
}