module.exports = [
"[project]/app/actions/update-profile-meeting-link.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40f82f28dd5a996aaf509b39c4c9339cf2118698db":"updateProfileMeetingLink"},"",""] */ __turbopack_context__.s([
    "updateProfileMeetingLink",
    ()=>updateProfileMeetingLink
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
/**
 * Validates if a URL is a valid meeting link format
 */ function isValidMeetingUrl(url) {
    try {
        const urlObj = new URL(url);
        // Must be HTTPS for security
        if (urlObj.protocol !== 'https:') {
            return false;
        }
        // Known meeting platforms
        const validDomains = [
            'zoom.us',
            'meet.google.com',
            'teams.microsoft.com',
            'meet.jit.si',
            'whereby.com',
            'discord.com',
            'discord.gg'
        ];
        // Check if domain matches any known platform or is a reasonable domain
        const hostname = urlObj.hostname.toLowerCase();
        const isKnownPlatform = validDomains.some((domain)=>hostname.includes(domain));
        const hasValidDomain = hostname.includes('.') && hostname.length > 3;
        return isKnownPlatform || hasValidDomain;
    } catch  {
        return false;
    }
}
/**
 * Auto-detects the meeting platform from URL
 */ function detectPlatform(url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('zoom.us')) return 'zoom';
    if (urlLower.includes('meet.google.com')) return 'meet';
    if (urlLower.includes('teams.microsoft.com')) return 'teams';
    if (urlLower.includes('meet.jit.si')) return 'jitsi';
    if (urlLower.includes('whereby.com')) return 'whereby';
    if (urlLower.includes('discord')) return 'discord';
    return 'other';
}
async function updateProfileMeetingLink(url) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error('Not authenticated');
    }
    // Validate URL if provided
    if (url) {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
            url = null; // Treat empty string as removal
        } else {
            if (!isValidMeetingUrl(trimmedUrl)) {
                throw new Error('Invalid meeting URL. Please use a valid HTTPS link from Zoom, Google Meet, Teams, or similar platforms.');
            }
            // Sanitize URL by reconstructing it
            try {
                const urlObj = new URL(trimmedUrl);
                url = urlObj.href;
            } catch  {
                throw new Error('Invalid URL format');
            }
        }
    }
    // Detect platform
    const platform = url ? detectPlatform(url) : null;
    // Update profile
    const { error: updateError } = await supabase.from('profiles').update({
        meeting_url: url,
        meeting_platform: platform
    }).eq('id', user.id);
    if (updateError) {
        console.error('Error updating meeting link:', updateError);
        throw new Error('Failed to update meeting link');
    }
    // Revalidate relevant pages
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/instructor/dashboard');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/student/dashboard');
    return {
        success: true,
        message: url ? 'Meeting link saved successfully' : 'Meeting link removed successfully'
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    updateProfileMeetingLink
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateProfileMeetingLink, "40f82f28dd5a996aaf509b39c4c9339cf2118698db", null);
}),
"[project]/.next-internal/server/app/instructor/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/instructor/layout.tsx [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/update-profile-meeting-link.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$instructor$2f$layout$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/instructor/layout.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$update$2d$profile$2d$meeting$2d$link$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/update-profile-meeting-link.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/.next-internal/server/app/instructor/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/instructor/layout.tsx [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/update-profile-meeting-link.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "005a47395ee536050a8af9c1ad30122913224fe862",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$instructor$2f$layout$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"],
    "40f82f28dd5a996aaf509b39c4c9339cf2118698db",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$update$2d$profile$2d$meeting$2d$link$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateProfileMeetingLink"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$instructor$2f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$instructor$2f$layout$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$update$2d$profile$2d$meeting$2d$link$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/instructor/dashboard/page/actions.js { ACTIONS_MODULE0 => "[project]/app/instructor/layout.tsx [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/actions/update-profile-meeting-link.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$instructor$2f$layout$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/instructor/layout.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$update$2d$profile$2d$meeting$2d$link$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/update-profile-meeting-link.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_70bb2473._.js.map