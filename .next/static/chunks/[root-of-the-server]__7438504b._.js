(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s({
    "connect": ()=>connect,
    "setHooks": ()=>setHooks,
    "subscribeToUpdate": ()=>subscribeToUpdate
});
function connect(param) {
    let { addMessageListener, sendMessage, onUpdateError = console.error } = param;
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: (param)=>{
            let [chunkPath, callback] = param;
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        var _updateA_modules;
        const deletedModules = new Set((_updateA_modules = updateA.modules) !== null && _updateA_modules !== void 0 ? _updateA_modules : []);
        var _updateB_modules;
        const addedModules = new Set((_updateB_modules = updateB.modules) !== null && _updateB_modules !== void 0 ? _updateB_modules : []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        var _updateA_added, _updateB_added;
        const added = new Set([
            ...(_updateA_added = updateA.added) !== null && _updateA_added !== void 0 ? _updateA_added : [],
            ...(_updateB_added = updateB.added) !== null && _updateB_added !== void 0 ? _updateB_added : []
        ]);
        var _updateA_deleted, _updateB_deleted;
        const deleted = new Set([
            ...(_updateA_deleted = updateA.deleted) !== null && _updateA_deleted !== void 0 ? _updateA_deleted : [],
            ...(_updateB_deleted = updateB.deleted) !== null && _updateB_deleted !== void 0 ? _updateB_deleted : []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        var _updateA_modules1, _updateB_added1;
        const modules = new Set([
            ...(_updateA_modules1 = updateA.modules) !== null && _updateA_modules1 !== void 0 ? _updateA_modules1 : [],
            ...(_updateB_added1 = updateB.added) !== null && _updateB_added1 !== void 0 ? _updateB_added1 : []
        ]);
        var _updateB_deleted1;
        for (const moduleId of (_updateB_deleted1 = updateB.deleted) !== null && _updateB_deleted1 !== void 0 ? _updateB_deleted1 : []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        var _updateB_modules1;
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set((_updateB_modules1 = updateB.modules) !== null && _updateB_modules1 !== void 0 ? _updateB_modules1 : []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error("Invariant: ".concat(message));
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/src/contexts/ThemeContext.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ThemeProvider": ()=>ThemeProvider,
    "useTheme": ()=>useTheme
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
const initialState = {
    theme: 'system',
    setTheme: ()=>null
};
const ThemeProviderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])(initialState);
function ThemeProvider(param) {
    let { children, defaultTheme = 'system', storageKey = 'vite-ui-theme', ...props } = param;
    _s();
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(defaultTheme);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            // Read from localStorage only on client
            const storedTheme = localStorage.getItem(storageKey);
            if (storedTheme) {
                setTheme(storedTheme);
            }
        }
    }["ThemeProvider.useEffect"], [
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
                return;
            }
            root.classList.add(theme);
        }
    }["ThemeProvider.useEffect"], [
        theme
    ]);
    const value = {
        theme,
        setTheme: (theme)=>{
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeProviderContext.Provider, {
        ...props,
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/ThemeContext.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_s(ThemeProvider, "W8D4/Q1J7zkRqv7jhld4gmhU6go=");
_c = ThemeProvider;
const useTheme = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeProviderContext);
    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
_s1(useTheme, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/contexts/LanguageContext.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "LanguageProvider": ()=>LanguageProvider,
    "useLanguage": ()=>useLanguage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const useLanguage = ()=>{
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
_s(useLanguage, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
// Translation data
const translations = {
    en: {
        // Navigation
        'nav.services': 'Services',
        'nav.caseStudies': 'Case Studies',
        'nav.blog': 'Blog',
        'nav.contact': 'Contact',
        'nav.freeAudit': 'Get Free Audit',
        'nav.back': 'Back',
        'nav.backHome': 'Back to Home',
        // Hero Section
        'hero.title': 'More Growth More Clients\nGuaranteed',
        'hero.subtitle': 'We partner with Ecom and SaaS teams to implement proven strategies that increase revenue within 30 days',
        'hero.cta': 'Get Your Free Marketing Audit',
        'hero.metric1': 'Active Clients Globally',
        'hero.metric2': 'Projects Delivered',
        'hero.metric3': 'Managed Last Year',
        // Services Section
        'services.badge': 'Services',
        'services.title': 'Complete Marketing Solutions',
        'services.subtitle': 'From strategy to execution, we provide end-to-end marketing services designed to accelerate your growth.',
        'services.performance.title': 'Performance Marketing',
        'services.performance.description': 'Dominate search and social with optimized paid campaigns that deliver measurable ROI.',
        'services.seo.title': 'SEO & Web Development',
        'services.seo.description': 'Build lasting organic growth with strategic SEO and modern web development solutions.',
        'services.analytics.title': 'Growth Analytics',
        'services.analytics.description': 'Turn data into actionable insights with comprehensive tracking and optimization.',
        'services.learnMore': 'Learn More',
        // Services - Flip Card Back Content
        'services.performance.features.googleAds': 'Google Ads & Meta Campaigns',
        'services.performance.features.targeting': 'Advanced Audience Targeting',
        'services.performance.features.roi': 'ROI-Focused Optimization',
        'services.performance.features.tracking': 'Real-time Performance Tracking',
        'services.seo.features.audits': 'Technical SEO Audits',
        'services.seo.features.content': 'Content Strategy & Creation',
        'services.seo.features.development': 'Modern Web Development',
        'services.seo.features.mobile': 'Mobile-First Design',
        'services.analytics.features.setup': 'Advanced Analytics Setup',
        'services.analytics.features.dashboards': 'Custom Dashboard Creation',
        'services.analytics.features.cro': 'Conversion Rate Optimization',
        'services.analytics.features.insights': 'Data-Driven Insights',
        // Contact Section
        'contact.badge': 'Contact',
        'contact.title': 'Growth waits for no one. Secure your spot now!',
        'contact.subtitle': 'Claim your free marketing audit and discover how we can accelerate your results.',
        'contact.formTitle': 'Get Your Free Marketing Audit',
        'contact.name': 'Name',
        'contact.email': 'Email',
        'contact.company': 'Company',
        'contact.challenge': 'Primary Challenge',
        'contact.challengePlaceholder': 'Tell us about your biggest marketing challenge...',
        'contact.submit': 'Get Your Free Audit',
        'contact.thankYou': 'Thank You!',
        'contact.thankYouMessage': 'We\'ve received your request. Our team will contact you within 24 hours to schedule your free marketing audit.',
        'contact.sendAnother': 'Send Another Message',
        'contact.getInTouch': 'Get in Touch',
        'contact.getInTouchSubtitle': 'Ready to transform your marketing? Let\'s discuss how we can help you achieve your growth goals.',
        'contact.emailUs': 'Email Us',
        'contact.emailDescription': 'Get in touch via email',
        'contact.callUs': 'Call Us',
        'contact.callDescription': 'Speak directly with our team',
        // Form Validation
        'form.nameRequired': 'Name is required',
        'form.emailRequired': 'Email is required',
        'form.emailInvalid': 'Please enter a valid email',
        'form.messageRequired': 'Message is required',
        'form.messageMinLength': 'Message must be at least 10 characters',
        // Footer
        'footer.description': 'Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let\'s grow together.',
        'footer.services': 'Services',
        'footer.ecommerce': 'E-commerce Marketing',
        'footer.saas': 'SaaS Growth',
        'footer.performance': 'Performance Marketing',
        'footer.cro': 'CRO',
        'footer.company': 'Company',
        'footer.about': 'About',
        'footer.caseStudies': 'Case Studies',
        'footer.blog': 'Blog',
        'footer.careers': 'Careers',
        'footer.copyright': '© 2025 Webtmize. All rights reserved.',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.cookies': 'Cookie Policy',
        // Case Studies Page
        'caseStudies.badge': 'Case Studies',
        'caseStudies.title': 'Proven Results',
        'caseStudies.subtitle': 'See how we\'ve helped companies like yours achieve extraordinary growth through strategic marketing and proven methodologies.',
        'caseStudies.viewCase': 'View Case Study',
        'caseStudies.ctaTitle': 'Ready to Be Our Next Success Story?',
        'caseStudies.ctaSubtitle': 'Let\'s discuss how we can help your business achieve similar results with our proven growth strategies.',
        'caseStudies.ctaButton': 'Get Your Free Marketing Audit',
        'caseStudies.notFound': 'Case Study Not Found',
        'caseStudies.returnHome': 'Return Home',
        // Case Study Detail
        'caseStudy.challenge': 'The Challenge',
        'caseStudy.solution': 'Our Solution',
        'caseStudy.results': 'The Results',
        'caseStudy.keyTakeaways': 'Key Takeaways',
        'caseStudy.footerText': 'Ready to transform your marketing? Let\'s discuss your growth goals.',
        'caseStudy.getStarted': 'Get Started Today',
        // FAQ
        'faq.question1': 'How quickly can we see results from your marketing efforts?',
        'faq.answer1': 'Most clients see initial improvements within 30-60 days, with significant results typically achieved within 3-6 months. However, timeline varies based on your current situation, industry, and goals.',
        'faq.question2': 'Do you work with both B2B and B2C companies?',
        'faq.answer2': 'Yes, we specialize in both B2B SaaS companies and B2C e-commerce brands. Our strategies are tailored to each business model\'s unique customer journey and sales cycle.',
        'faq.question3': 'What\'s included in your free marketing audit?',
        'faq.answer3': 'Our comprehensive audit includes analysis of your current marketing channels, conversion funnel assessment, competitive analysis, and a prioritized action plan with specific recommendations.',
        'faq.question4': 'How do you measure and report on campaign performance?',
        'faq.answer4': 'We provide detailed monthly reports with key metrics, insights, and recommendations. You\'ll have access to real-time dashboards and regular strategy calls to discuss performance and optimizations.',
        'faq.question5': 'What makes your agency different from others?',
        'faq.answer5': 'We focus exclusively on e-commerce and SaaS, bringing deep industry expertise. Our data-driven approach, proven methodologies, and commitment to transparent reporting set us apart.',
        // Phone and Address
        'contact.phone': '+1 (555) 123-4567',
        'contact.address': 'San Francisco, CA'
    },
    fr: {
        // Navigation
        'nav.services': 'Services',
        'nav.caseStudies': 'Études',
        'nav.blog': 'Blog',
        'nav.contact': 'Contact',
        'nav.freeAudit': 'Audit Gratuit',
        'nav.back': 'Retour',
        'nav.backHome': 'Retour à l\'Accueil',
        // Hero Section
        'hero.title': 'Plus de croissance, plus de clients :\nc\'est garanti',
        'hero.subtitle': 'Nous accompagnons les équipes e-commerce et SaaS dans la mise en œuvre de stratégies éprouvées qui augmentent les revenus en 30 jours',
        'hero.cta': 'Obtenez votre audit marketing gratuit',
        'hero.metric1': 'Clients actifs dans le monde',
        'hero.metric2': 'Projets livrés',
        'hero.metric3': 'Gérés l\'année dernière',
        // Services Section
        'services.badge': 'Services',
        'services.title': 'Solutions marketing complètes',
        'services.subtitle': 'De la stratégie à l\'exécution, nous fournissons des services marketing de bout en bout conçus pour accélérer votre croissance.',
        'services.performance.title': 'Marketing de performance',
        'services.performance.description': 'Dominez les moteurs de recherche et les réseaux sociaux avec des campagnes payantes optimisées qui offrent un ROI mesurable.',
        'services.seo.title': 'SEO et développement web',
        'services.seo.description': 'Construisez une croissance organique durable avec des solutions SEO stratégiques et de développement web moderne.',
        'services.analytics.title': 'Analytique de croissance',
        'services.analytics.description': 'Transformez les données en insights actionnables avec un suivi et une optimisation complets.',
        'services.learnMore': 'En savoir plus',
        // Services - Flip Card Back Content
        'services.performance.features.googleAds': 'Campagnes Google Ads et Meta',
        'services.performance.features.targeting': 'Ciblage d\'audience avancé',
        'services.performance.features.roi': 'Optimisation axée sur le ROI',
        'services.performance.features.tracking': 'Suivi des performances en temps réel',
        'services.seo.features.audits': 'Audits SEO techniques',
        'services.seo.features.content': 'Stratégie et création de contenu',
        'services.seo.features.development': 'Développement web moderne',
        'services.seo.features.mobile': 'Design mobile-first',
        'services.analytics.features.setup': 'Configuration d\'analytiques avancées',
        'services.analytics.features.dashboards': 'Création de tableaux de bord personnalisés',
        'services.analytics.features.cro': 'Optimisation du taux de conversion',
        'services.analytics.features.insights': 'Insights basés sur les données',
        // Contact Section
        'contact.badge': 'Contact',
        'contact.title': 'La croissance n\'attend personne. Réservez votre place maintenant !',
        'contact.subtitle': 'Réclamez votre audit marketing gratuit et découvrez comment nous pouvons accélérer vos résultats.',
        'contact.formTitle': 'Obtenez votre audit marketing gratuit',
        'contact.name': 'Nom',
        'contact.email': 'Email',
        'contact.company': 'Entreprise',
        'contact.challenge': 'Défi principal',
        'contact.challengePlaceholder': 'Parlez-nous de votre plus grand défi marketing...',
        'contact.submit': 'Obtenez votre audit gratuit',
        'contact.thankYou': 'Merci !',
        'contact.thankYouMessage': 'Nous avons reçu votre demande. Notre équipe vous contactera dans les 24 heures pour planifier votre audit marketing gratuit.',
        'contact.sendAnother': 'Envoyer un autre message',
        'contact.getInTouch': 'Contactez-nous',
        'contact.getInTouchSubtitle': 'Prêt à transformer votre marketing ? Discutons de la façon dont nous pouvons vous aider à atteindre vos objectifs de croissance.',
        'contact.emailUs': 'Envoyez-nous un email',
        'contact.emailDescription': 'Contactez-nous par email',
        'contact.callUs': 'Appelez-nous',
        'contact.callDescription': 'Parlez directement avec notre équipe',
        // Form Validation
        'form.nameRequired': 'Le nom est requis',
        'form.emailRequired': 'L\'email est requis',
        'form.emailInvalid': 'Veuillez entrer un email valide',
        'form.messageRequired': 'Le message est requis',
        'form.messageMinLength': 'Le message doit contenir au moins 10 caractères',
        // Footer
        'footer.description': 'Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble.',
        'footer.services': 'Services',
        'footer.ecommerce': 'Marketing e-commerce',
        'footer.saas': 'Croissance SaaS',
        'footer.performance': 'Marketing de performance',
        'footer.cro': 'CRO',
        'footer.company': 'Entreprise',
        'footer.about': 'À propos',
        'footer.caseStudies': 'Études',
        'footer.blog': 'Blog',
        'footer.careers': 'Carrières',
        'footer.copyright': '© 2025 Webtmize. Tous droits réservés.',
        'footer.privacy': 'Politique de confidentialité',
        'footer.terms': 'Conditions d\'utilisation',
        'footer.cookies': 'Politique des cookies',
        // Case Studies Page
        'caseStudies.badge': 'Études',
        'caseStudies.title': 'Résultats prouvés',
        'caseStudies.subtitle': 'Découvrez comment nous avons aidé des entreprises comme la vôtre à atteindre une croissance extraordinaire grâce au marketing stratégique et à des méthodologies éprouvées.',
        'caseStudies.viewCase': 'Voir l\'étude de cas',
        'caseStudies.ctaTitle': 'Prêt à être notre prochaine success story ?',
        'caseStudies.ctaSubtitle': 'Discutons de la façon dont nous pouvons aider votre entreprise à obtenir des résultats similaires avec nos stratégies de croissance éprouvées.',
        'caseStudies.ctaButton': 'Obtenez votre audit marketing gratuit',
        'caseStudies.notFound': 'Étude de cas non trouvée',
        'caseStudies.returnHome': 'Retour à l\'accueil',
        // Case Study Detail
        'caseStudy.challenge': 'Le défi',
        'caseStudy.solution': 'Notre solution',
        'caseStudy.results': 'Les résultats',
        'caseStudy.keyTakeaways': 'Points clés à retenir',
        'caseStudy.footerText': 'Prêt à transformer votre marketing ? Discutons de vos objectifs de croissance.',
        'caseStudy.getStarted': 'Commencez aujourd\'hui',
        // FAQ
        'faq.question1': 'À quelle vitesse pouvons-nous voir les résultats de vos efforts marketing ?',
        'faq.answer1': 'La plupart des clients voient des améliorations initiales dans les 30-60 jours, avec des résultats significatifs généralement obtenus dans les 3-6 mois. Cependant, le délai varie selon votre situation actuelle, votre secteur et vos objectifs.',
        'faq.question2': 'Travaillez-vous avec les entreprises B2B et B2C ?',
        'faq.answer2': 'Oui, nous nous spécialisons dans les entreprises SaaS B2B et les marques e-commerce B2C. Nos stratégies sont adaptées au parcours client unique et au cycle de vente de chaque modèle d\'affaires.',
        'faq.question3': 'Qu\'est-ce qui est inclus dans votre audit marketing gratuit ?',
        'faq.answer3': 'Notre audit complet inclut l\'analyse de vos canaux marketing actuels, l\'évaluation de l\'entonnoir de conversion, l\'analyse concurrentielle, et un plan d\'action priorisé avec des recommandations spécifiques.',
        'faq.question4': 'Comment mesurez-vous et rapportez-vous les performances des campagnes ?',
        'faq.answer4': 'Nous fournissons des rapports mensuels détaillés avec des métriques clés, des insights et des recommandations. Vous aurez accès à des tableaux de bord en temps réel et à des appels stratégiques réguliers pour discuter des performances et optimisations.',
        'faq.question5': 'Qu\'est-ce qui rend votre agence différente des autres ?',
        'faq.answer5': 'Nous nous concentrons exclusivement sur l\'e-commerce et le SaaS, apportant une expertise sectorielle approfondie. Notre approche axée sur les données, nos méthodologies éprouvées et notre engagement envers la transparence nous distinguent.',
        // Phone and Address
        'contact.phone': '+33 1 23 45 67 89',
        'contact.address': 'Paris, France'
    }
};
const LanguageProvider = (param)=>{
    let { children } = param;
    _s1();
    // Get initial language from URL parameter or default to 'en'
    const getInitialLanguage = ()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            const urlParams = new URLSearchParams(window.location.search);
            const langParam = urlParams.get('lang');
            if (langParam === 'fr' || langParam === 'en') {
                return langParam;
            }
        }
        return 'en';
    };
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(getInitialLanguage);
    // Update URL when language changes (without causing page reload)
    const handleLanguageChange = (lang)=>{
        setLanguage(lang);
        if ("TURBOPACK compile-time truthy", 1) {
            const url = new URL(window.location.href);
            if (lang === 'fr') {
                url.searchParams.set('lang', 'fr');
            } else {
                url.searchParams.delete('lang');
            }
            // Update URL without reloading the page
            window.history.replaceState({}, '', url.toString());
        }
    };
    const t = (key)=>{
        return translations[language][key] || key;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            language,
            setLanguage: handleLanguageChange,
            t
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/LanguageContext.tsx",
        lineNumber: 318,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(LanguageProvider, "eWxanHUxrFz1zgI6STOMLieClEA=");
_c = LanguageProvider;
var _c;
__turbopack_context__.k.register(_c, "LanguageProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/voiceflow-chat.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const VoiceflowChat = (param)=>{
    let { autoLoad = true } = param;
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VoiceflowChat.useEffect": ()=>{
            // Only run on client-side and if autoLoad is true
            if ("object" === 'undefined' || !autoLoad) return;
            // Check if Voiceflow is already loaded
            if (window.voiceflow) {
                return;
            }
            const voiceflowProjectId = '6879820015a3d2e835a9a691';
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            // Check if script is already being loaded or exists
            const existingScript = document.querySelector('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]');
            if (existingScript) {
                return;
            }
            // Function to load Voiceflow chat script
            const loadVoiceflowChat = {
                "VoiceflowChat.useEffect.loadVoiceflowChat": ()=>{
                    const script = document.createElement('script');
                    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
                    script.type = "text/javascript";
                    script.async = true;
                    script.onload = ({
                        "VoiceflowChat.useEffect.loadVoiceflowChat": function() {
                            if (window.voiceflow && window.voiceflow.chat) {
                                window.voiceflow.chat.load({
                                    verify: {
                                        projectID: voiceflowProjectId
                                    },
                                    url: 'https://general-runtime.voiceflow.com',
                                    versionID: 'production',
                                    voice: {
                                        url: "https://runtime-api.voiceflow.com"
                                    }
                                });
                            }
                        }
                    })["VoiceflowChat.useEffect.loadVoiceflowChat"];
                    // Append the script to the head instead of body
                    document.head.appendChild(script);
                }
            }["VoiceflowChat.useEffect.loadVoiceflowChat"];
            // Load the Voiceflow chat script
            loadVoiceflowChat();
            // Cleanup function
            return ({
                "VoiceflowChat.useEffect": ()=>{
                    // Remove Voiceflow chat widget if it exists
                    if (window.voiceflow && window.voiceflow.chat) {
                        try {
                            // Try to close/destroy the chat widget
                            const chatWidget = document.querySelector('[data-voiceflow-chat]') || document.querySelector('.vfrc-chat') || document.querySelector('#voiceflow-chat');
                            if (chatWidget) {
                                chatWidget.remove();
                            }
                        } catch (error) {
                            console.warn('Error cleaning up Voiceflow chat:', error);
                        }
                    }
                    // Remove the script
                    const scripts = document.querySelectorAll('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]');
                    scripts.forEach({
                        "VoiceflowChat.useEffect": (script)=>script.remove()
                    }["VoiceflowChat.useEffect"]);
                    // Clear the voiceflow object
                    if (window.voiceflow) {
                        window.voiceflow = undefined;
                    }
                }
            })["VoiceflowChat.useEffect"];
        }
    }["VoiceflowChat.useEffect"], [
        autoLoad
    ]);
    return null; // This component doesn't render anything
};
_s(VoiceflowChat, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = VoiceflowChat;
const __TURBOPACK__default__export__ = VoiceflowChat;
var _c;
__turbopack_context__.k.register(_c, "VoiceflowChat");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/pages/_app.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>App
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/head.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ThemeContext.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$voiceflow$2d$chat$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/voiceflow-chat.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
function AppContent(param) {
    let { Component, pageProps } = param;
    _s();
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppContent.useEffect": ()=>{
            // Set HTML lang attribute dynamically
            document.documentElement.lang = language;
            // Add hreflang links dynamically to avoid TypeScript issues
            const existingHreflangs = document.querySelectorAll('link[hreflang]');
            existingHreflangs.forEach({
                "AppContent.useEffect": (link)=>link.remove()
            }["AppContent.useEffect"]);
            // Get current path without query parameters for canonical URL
            const currentPath = window.location.pathname;
            const canonicalUrl = "https://webascendio.com".concat(currentPath);
            const hreflangs = [
                {
                    hreflang: 'en',
                    href: canonicalUrl
                },
                {
                    hreflang: 'fr',
                    href: canonicalUrl
                },
                {
                    hreflang: 'x-default',
                    href: canonicalUrl
                }
            ];
            hreflangs.forEach({
                "AppContent.useEffect": (param)=>{
                    let { hreflang, href } = param;
                    const link = document.createElement('link');
                    link.rel = 'alternate';
                    link.hreflang = hreflang;
                    link.href = href;
                    document.head.appendChild(link);
                }
            }["AppContent.useEffect"]);
            // Update canonical link
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (canonicalLink) {
                canonicalLink.href = canonicalUrl;
            } else {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = 'canonical';
                canonicalLink.href = canonicalUrl;
                document.head.appendChild(canonicalLink);
            }
        }
    }["AppContent.useEffect"], [
        language
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$head$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                        children: "Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies."
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "robots",
                        content: "index, follow"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "googlebot",
                        content: "index, follow"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        httpEquiv: "Content-Type",
                        content: "text/html; charset=utf-8"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "language",
                        content: language
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "canonical",
                        href: "https://webascendio.com"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:title",
                        content: "Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:description",
                        content: "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies."
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:type",
                        content: "website"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:url",
                        content: "https://webascendio.com"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:image",
                        content: "https://webascendio.com/og-image.jpg"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:site_name",
                        content: "Webtmize"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        property: "og:locale",
                        content: language === 'fr' ? 'fr_FR' : 'en_US'
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "twitter:card",
                        content: "summary_large_image"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "twitter:site",
                        content: "@webtmize"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "twitter:title",
                        content: "Webtmize - Digital Marketing Agency for E-commerce & SaaS Growth"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "twitter:description",
                        content: "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together with proven strategies."
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "twitter:image",
                        content: "https://webascendio.com/og-image.jpg"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "apple-touch-icon",
                        sizes: "180x180",
                        href: "/apple-touch-icon.png"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        type: "image/png",
                        sizes: "32x32",
                        href: "/favicon-32x32.png"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        type: "image/png",
                        sizes: "16x16",
                        href: "/favicon-16x16.png"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "theme-color",
                        content: "#2563eb"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "msapplication-TileColor",
                        content: "#2563eb"
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                        type: "application/ld+json",
                        dangerouslySetInnerHTML: {
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "Organization",
                                "name": "Webtmize",
                                "description": language === 'fr' ? "Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble." : "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together.",
                                "url": "https://webascendio.com",
                                "logo": "https://webascendio.com/logo.png",
                                "contactPoint": {
                                    "@type": "ContactPoint",
                                    "telephone": "+1-555-123-4567",
                                    "contactType": "customer service",
                                    "email": "hello@webascendio.com"
                                },
                                "address": {
                                    "@type": "PostalAddress",
                                    "addressLocality": language === 'fr' ? "Paris" : "San Francisco",
                                    "addressCountry": language === 'fr' ? "FR" : "US"
                                },
                                "sameAs": [
                                    "https://linkedin.com/company/webtmize",
                                    "https://twitter.com/webtmize"
                                ]
                            })
                        }
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
                ...pageProps
            }, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$voiceflow$2d$chat$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(AppContent, "bQmhoTNnUKBArwEgsVQiWN7+tZA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useLanguage"]
    ];
});
_c = AppContent;
function App(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        defaultTheme: "light",
        storageKey: "webtmize-theme",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["LanguageProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContent, {
                ...props
            }, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 132,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/_app.tsx",
            lineNumber: 131,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/_app.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
_c1 = App;
var _c, _c1;
__turbopack_context__.k.register(_c, "AppContent");
__turbopack_context__.k.register(_c1, "App");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/_app.tsx [client] (ecmascript)\" } [client] (ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const PAGE_PATH = "/_app";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/_app.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/_app\" }": ((__turbopack_context__) => {
"use strict";

var { m: module } = __turbopack_context__;
{
__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/_app.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__7438504b._.js.map