// Centralized role precedence and routing helpers

export const ROLE_ORDER = ["ADMIN", "MANAGER", "TEACHER", "STUDENT"] as const;

export type AppRole = (typeof ROLE_ORDER)[number];

/**
 * Returns the highest-priority role from a list, based on ROLE_ORDER.
 * If none of the known roles are present, falls back to the first role or null.
 */
export function getHighestPriorityRole(roles: string[] | null | undefined): string | null {
    if (!Array.isArray(roles) || roles.length === 0) {
        return null;
    }

    for (const role of ROLE_ORDER) {
        if (roles.includes(role)) {
            return role;
        }
    }

    // If no known role matched, fall back to the first entry
    return roles[0] ?? null;
}

/**
 * Maps a role to its default dashboard/home route.
 * MANAGER currently shares the /admin dashboard.
 */
export function getRouteForRole(role: string | null | undefined): string {
    switch (role) {
        case "ADMIN":
            return "/admin";
        case "MANAGER":
            // TODO: Later, change this to a dedicated /manager dashboard route
            return "/admin";
        case "TEACHER":
            return "/teacher";
        case "STUDENT":
            return "/";
        default:
            return "/";
    }
}

