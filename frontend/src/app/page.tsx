"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getHighestPriorityRole, getRouteForRole } from "@/lib/roles";

import Hero from "@/components/Hero";
import ValueProps from "@/components/ValueProps";
import FeaturedCourses from "@/components/FeaturedCourses";
import FreeChapterList from "@/components/FreeChapterList";
import ClassesListSection from "@/components/ClassesListSection";
import ShopHomeSection from "@/components/shop/ShopHomeSection";

export default function HomePage() {
    const router = useRouter();
    const { isLoading, isLoggedIn, user, activeRole } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        // Allow unauthenticated visitors to see the marketing homepage
        if (!isLoggedIn) return;

        const roles = user?.roles || [];
        if (roles.length === 0) return;

        // If the user is only a STUDENT, keep them on the homepage
        // TODO: In future, redirect to /student/dashboard
        if (roles.length === 1 && roles[0] === "STUDENT") {
            // router.replace("/student/dashboard"); // Planned change
            return;
        }

        // Determine which role should control the redirect:
        // 1) Prefer the current activeRole if it's non-STUDENT and valid
        // 2) Otherwise fall back to the highest-priority non-STUDENT role
        let targetRole: string | null = null;

        if (activeRole && activeRole !== "STUDENT" && roles.includes(activeRole)) {
            targetRole = activeRole;
        } else {
            const primaryRole = getHighestPriorityRole(roles);
            if (primaryRole && primaryRole !== "STUDENT") {
                targetRole = primaryRole;
            }
        }

        // If generic student or no role catch, stay here (or go to dashboard later)
        if (!targetRole || targetRole === "STUDENT") {
            return;
        }

        const targetPath = getRouteForRole(targetRole);

        // Avoid redirect loops if mapping ever returns '/'
        if (targetPath && targetPath !== "/") {
            router.replace(targetPath);
        }
    }, [isLoading, isLoggedIn, user, activeRole, router]);

    return (
        <main className="overflow-x-hidden">
            <Hero />
            <ClassesListSection />
            <div id="free">
                <FreeChapterList />
            </div>
            <div id="featured">
                <FeaturedCourses />
            </div>
            <ShopHomeSection />
            <ValueProps />
        </main>
    );
}
