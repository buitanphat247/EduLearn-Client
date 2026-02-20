import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decryptCookie } from "@/lib/utils/server-cookie-decrypt";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";

export const dynamic = "force-dynamic";

async function checkUserAuth() {
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("_u");

        if (!userCookie?.value) {
            return false;
        }

        try {
            const decryptedUser = decryptCookie(userCookie.value);
            const userData = JSON.parse(decryptedUser);
            if (!userData || typeof userData !== 'object') {
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    } catch (error) {
        return false;
    }
}

export default async function NotificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuth = await checkUserAuth();

    if (!isAuth) {
        redirect("/auth");
    }

    return (
        <RouteErrorBoundary routeName="notifications">
            {children}
        </RouteErrorBoundary>
    );
}
