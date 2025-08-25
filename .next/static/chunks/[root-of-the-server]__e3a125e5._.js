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
"[project]/src/lib/utils.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": ()=>cn
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$2$2e$6$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/tailwind-merge@2.6.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs [client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$2$2e$6$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/badge.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Badge": ()=>Badge,
    "badgeVariants": ()=>badgeVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [client] (ecmascript)");
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
            secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
            destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
            outline: 'text-foreground'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
function Badge(param) {
    let { className, variant, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/badge.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/button.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": ()=>Button,
    "buttonVariants": ()=>buttonVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$slot$40$1$2e$2$2e$3_$40$types$2b$react$40$18$2e$3$2e$23_react$40$18$2e$3$2e$1$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@radix-ui+react-slot@1.2.3_@types+react@18.3.23_react@18.3.1/node_modules/@radix-ui/react-slot/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50', {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
            outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2',
            sm: 'h-8 rounded-md px-3 text-xs',
            lg: 'h-10 rounded-md px-8',
            icon: 'h-9 w-9'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$slot$40$1$2e$2$2e$3_$40$types$2b$react$40$18$2e$3$2e$23_react$40$18$2e$3$2e$1$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 47,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = 'Button';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/flip-card.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "FlipCard": ()=>FlipCard,
    "FlipCardBack": ()=>FlipCardBack,
    "FlipCardFront": ()=>FlipCardFront
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@10.18.0_react_39718d184a546e7029955c4644d61736/node_modules/framer-motion/dist/es/render/dom/motion.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
"use client";
;
;
;
const TRANSITION_CONFIG = {
    duration: 0.7,
    ease: [
        0.4,
        0.2,
        0.2,
        1
    ],
    transition: "0.7s cubic-bezier(0.4, 0.2, 0.2, 1)"
};
const TRANSFORM_STYLES = {
    transformStyle: "preserve-3d",
    perspective: "1000px",
    backfaceVisibility: "hidden"
};
const FlipCardContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"](undefined);
function useFlipCardContext() {
    _s();
    const context = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"](FlipCardContext);
    if (!context) {
        throw new Error("useFlipCardContext must be used within a FlipCard");
    }
    return context;
}
_s(useFlipCardContext, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const FlipCard = /*#__PURE__*/ _s1(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["memo"](/*#__PURE__*/ _c1 = _s1(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = _s1((param, ref)=>{
    let { className, flipDirection = "horizontal", initialFlipped = false, onFlip, disabled, ...props } = param;
    _s1();
    const [isFlipped, setIsFlipped] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"](initialFlipped);
    const handleMouseEnter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "FlipCard.useCallback[handleMouseEnter]": ()=>{
            if (!disabled) {
                setIsFlipped(true);
                onFlip === null || onFlip === void 0 ? void 0 : onFlip(true);
            }
        }
    }["FlipCard.useCallback[handleMouseEnter]"], [
        disabled,
        onFlip
    ]);
    const handleMouseLeave = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "FlipCard.useCallback[handleMouseLeave]": ()=>{
            if (!disabled) {
                setIsFlipped(false);
                onFlip === null || onFlip === void 0 ? void 0 : onFlip(false);
            }
        }
    }["FlipCard.useCallback[handleMouseLeave]"], [
        disabled,
        onFlip
    ]);
    const contextValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "FlipCard.useMemo[contextValue]": ()=>({
                isFlipped,
                flipDirection,
                disabled
            })
    }["FlipCard.useMemo[contextValue]"], [
        isFlipped,
        flipDirection,
        disabled
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FlipCardContext.Provider, {
        value: contextValue,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: ref,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])("relative border-none bg-none shadow-none", disabled && "pointer-events-none", className),
            style: {
                ...TRANSFORM_STYLES,
                ...props.style
            },
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            role: "button",
            tabIndex: disabled ? -1 : 0,
            "aria-pressed": isFlipped,
            ...props
        }, void 0, false, {
            fileName: "[project]/src/components/ui/flip-card.tsx",
            lineNumber: 79,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/flip-card.tsx",
        lineNumber: 78,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
}, "zPA4cDK8gx9PAQgbnRV2Z9EgD/M=")), "zPA4cDK8gx9PAQgbnRV2Z9EgD/M=")), "zPA4cDK8gx9PAQgbnRV2Z9EgD/M=");
_c2 = FlipCard;
FlipCard.displayName = "FlipCard";
const FlipCardFront = /*#__PURE__*/ _s2(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["memo"](/*#__PURE__*/ _c4 = _s2(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c3 = _s2((param, ref)=>{
    let { className, ...props } = param;
    _s2();
    const { isFlipped, flipDirection } = useFlipCardContext();
    const rotation = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "FlipCardFront.useMemo[rotation]": ()=>{
            if (!isFlipped) return {
                rotateX: 0,
                rotateY: 0
            };
            return flipDirection === "horizontal" ? {
                rotateY: -180,
                rotateX: 0
            } : {
                rotateX: -180,
                rotateY: 0
            };
        }
    }["FlipCardFront.useMemo[rotation]"], [
        isFlipped,
        flipDirection
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])("absolute inset-0 z-20 size-full overflow-hidden", className),
        initial: false,
        animate: rotation,
        transition: TRANSITION_CONFIG,
        style: {
            ...TRANSFORM_STYLES,
            ...props.style
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/flip-card.tsx",
        lineNumber: 117,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
}, "qa3K60estts0AFVh+43UXMhn2E8=", false, function() {
    return [
        useFlipCardContext
    ];
})), "qa3K60estts0AFVh+43UXMhn2E8=", false, function() {
    return [
        useFlipCardContext
    ];
})), "qa3K60estts0AFVh+43UXMhn2E8=", false, function() {
    return [
        useFlipCardContext
    ];
});
_c5 = FlipCardFront;
FlipCardFront.displayName = "FlipCardFront";
const FlipCardBack = /*#__PURE__*/ _s3(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["memo"](/*#__PURE__*/ _c7 = _s3(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = _s3((param, ref)=>{
    let { className, ...props } = param;
    _s3();
    const { isFlipped, flipDirection } = useFlipCardContext();
    const rotation = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "FlipCardBack.useMemo[rotation]": ()=>{
            if (isFlipped) return {
                rotateX: 0,
                rotateY: 0
            };
            return flipDirection === "horizontal" ? {
                rotateY: 180,
                rotateX: 0
            } : {
                rotateX: 180,
                rotateY: 0
            };
        }
    }["FlipCardBack.useMemo[rotation]"], [
        isFlipped,
        flipDirection
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])("absolute inset-0 z-10 size-full", className),
        initial: false,
        animate: rotation,
        transition: TRANSITION_CONFIG,
        style: {
            ...TRANSFORM_STYLES,
            ...props.style
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/flip-card.tsx",
        lineNumber: 151,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
}, "qa3K60estts0AFVh+43UXMhn2E8=", false, function() {
    return [
        useFlipCardContext
    ];
})), "qa3K60estts0AFVh+43UXMhn2E8=", false, function() {
    return [
        useFlipCardContext
    ];
})), "qa3K60estts0AFVh+43UXMhn2E8=", false, function() {
    return [
        useFlipCardContext
    ];
});
_c8 = FlipCardBack;
FlipCardBack.displayName = "FlipCardBack";
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "FlipCard$React.memo$React.forwardRef");
__turbopack_context__.k.register(_c1, "FlipCard$React.memo");
__turbopack_context__.k.register(_c2, "FlipCard");
__turbopack_context__.k.register(_c3, "FlipCardFront$React.memo$React.forwardRef");
__turbopack_context__.k.register(_c4, "FlipCardFront$React.memo");
__turbopack_context__.k.register(_c5, "FlipCardFront");
__turbopack_context__.k.register(_c6, "FlipCardBack$React.memo$React.forwardRef");
__turbopack_context__.k.register(_c7, "FlipCardBack$React.memo");
__turbopack_context__.k.register(_c8, "FlipCardBack");
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
"[project]/src/components/ui/language-switcher.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/globe.js [client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const LanguageSwitcher = ()=>{
    _s();
    const { language, setLanguage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    const toggleLanguage = ()=>{
        setLanguage(language === 'en' ? 'fr' : 'en');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
        variant: "outline",
        size: "sm",
        onClick: toggleLanguage,
        className: "flex items-center gap-2 h-9 px-3 bg-background/50 hover:bg-background/80 border-input",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/language-switcher.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm font-medium",
                children: language.toUpperCase()
            }, void 0, false, {
                fileName: "[project]/src/components/ui/language-switcher.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/language-switcher.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LanguageSwitcher, "UZUYajh7f/ecAaqs8+JAYjvISYI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useLanguage"]
    ];
});
_c = LanguageSwitcher;
const __TURBOPACK__default__export__ = LanguageSwitcher;
var _c;
__turbopack_context__.k.register(_c, "LanguageSwitcher");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
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
"[project]/src/components/ui/liquid-radio.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "GlassFilter": ()=>GlassFilter
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function GlassFilter() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
                id: "radio-glass",
                x: "0%",
                y: "0%",
                width: "100%",
                height: "100%",
                colorInterpolationFilters: "sRGB",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feTurbulence", {
                        type: "fractalNoise",
                        baseFrequency: "0.05 0.05",
                        numOctaves: "1",
                        seed: "1",
                        result: "turbulence"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/liquid-radio.tsx",
                        lineNumber: 13,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feGaussianBlur", {
                        in: "turbulence",
                        stdDeviation: "2",
                        result: "blurredNoise"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/liquid-radio.tsx",
                        lineNumber: 20,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feDisplacementMap", {
                        in: "SourceGraphic",
                        in2: "blurredNoise",
                        scale: "30",
                        xChannelSelector: "R",
                        yChannelSelector: "B",
                        result: "displaced"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/liquid-radio.tsx",
                        lineNumber: 21,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feGaussianBlur", {
                        in: "displaced",
                        stdDeviation: "2",
                        result: "finalBlur"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/liquid-radio.tsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feComposite", {
                        in: "finalBlur",
                        in2: "finalBlur",
                        operator: "over"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/liquid-radio.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/liquid-radio.tsx",
                lineNumber: 5,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ui/liquid-radio.tsx",
            lineNumber: 4,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/liquid-radio.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
_c = GlassFilter;
var _c;
__turbopack_context__.k.register(_c, "GlassFilter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/radio-group.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "RadioGroup": ()=>RadioGroup,
    "RadioGroupItem": ()=>RadioGroupItem
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group_b1ae1a9c73c57c23bed24c67bcc8d1af$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@radix-ui+react-radio-group_b1ae1a9c73c57c23bed24c67bcc8d1af/node_modules/@radix-ui/react-radio-group/dist/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [client] (ecmascript)");
"use client";
;
;
;
;
const RadioGroup = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group_b1ae1a9c73c57c23bed24c67bcc8d1af$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])("grid gap-3", className),
        ...props,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/src/components/ui/radio-group.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = RadioGroup;
RadioGroup.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group_b1ae1a9c73c57c23bed24c67bcc8d1af$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Root"].displayName;
const RadioGroupItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group_b1ae1a9c73c57c23bed24c67bcc8d1af$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cn"])("aspect-square size-4 rounded-full border border-input shadow-sm shadow-black/5 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group_b1ae1a9c73c57c23bed24c67bcc8d1af$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Indicator"], {
            className: "flex items-center justify-center text-current",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: "6",
                height: "6",
                viewBox: "0 0 6 6",
                fill: "currentcolor",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "3",
                    cy: "3",
                    r: "3"
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/radio-group.tsx",
                    lineNumber: 37,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/radio-group.tsx",
                lineNumber: 30,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/ui/radio-group.tsx",
            lineNumber: 29,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/radio-group.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c3 = RadioGroupItem;
RadioGroupItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$radio$2d$group_b1ae1a9c73c57c23bed24c67bcc8d1af$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$radio$2d$group$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["Item"].displayName;
;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "RadioGroup$React.forwardRef");
__turbopack_context__.k.register(_c1, "RadioGroup");
__turbopack_context__.k.register(_c2, "RadioGroupItem$React.forwardRef");
__turbopack_context__.k.register(_c3, "RadioGroupItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/theme-toggle.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ThemeToggle": ()=>ThemeToggle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/moon.js [client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/sun.js [client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ThemeContext.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$liquid$2d$radio$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/liquid-radio.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/radio-group.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ThemeToggle() {
    _s();
    const { theme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useTheme"])();
    // Convert theme to radio value (light/dark, ignoring system)
    const currentTheme = theme === 'system' ? 'light' : theme;
    const handleThemeChange = (value)=>{
        setTheme(value);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "inline-flex h-9 rounded-lg bg-input/50 p-0.5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["RadioGroup"], {
            value: currentTheme,
            onValueChange: handleThemeChange,
            className: "group relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:bg-background/80 after:shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-ring/70 data-[state=dark]:after:translate-x-0 data-[state=light]:after:translate-x-full dark:after:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]",
            "data-state": currentTheme,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md",
                    style: {
                        filter: 'url("#radio-glass")'
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/theme-toggle.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-muted-foreground/70 group-data-[state=light]:text-muted-foreground/70 group-data-[state=dark]:text-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/theme-toggle.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["RadioGroupItem"], {
                            id: "theme-dark",
                            value: "dark",
                            className: "sr-only"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/theme-toggle.tsx",
                            lineNumber: 32,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ui/theme-toggle.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors text-muted-foreground/70 group-data-[state=dark]:text-muted-foreground/70 group-data-[state=light]:text-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/theme-toggle.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["RadioGroupItem"], {
                            id: "theme-light",
                            value: "light",
                            className: "sr-only"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/theme-toggle.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ui/theme-toggle.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$liquid$2d$radio$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["GlassFilter"], {}, void 0, false, {
                    fileName: "[project]/src/components/ui/theme-toggle.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ui/theme-toggle.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/theme-toggle.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(ThemeToggle, "5ABGV54qnXKp6rHn7MS/8MjwRhQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ThemeContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = ThemeToggle;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/useSEO.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "generateArticleSchema": ()=>generateArticleSchema,
    "generateOrganizationSchema": ()=>generateOrganizationSchema,
    "generateWebsiteSchema": ()=>generateWebsiteSchema,
    "useSEO": ()=>useSEO
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
const useSEO = (seoData)=>{
    _s();
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSEO.useEffect": ()=>{
            // Set language attribute
            document.documentElement.lang = language;
            // Helper function to update meta
            const updateMetaTag = {
                "useSEO.useEffect.updateMetaTag": function(name, content) {
                    let property = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                    const attribute = property ? 'property' : 'name';
                    const selector = "meta[".concat(attribute, '="').concat(name, '"]');
                    let element = document.querySelector(selector);
                    if (element) {
                        element.setAttribute('content', content);
                    } else {
                        element = document.createElement('meta');
                        element.setAttribute(attribute, name);
                        element.setAttribute('content', content);
                        document.head.appendChild(element);
                    }
                }
            }["useSEO.useEffect.updateMetaTag"];
            // Helper function to update title
            const updateTitle = {
                "useSEO.useEffect.updateTitle": (title)=>{
                    document.title = title;
                    let titleElement = document.querySelector('title');
                    if (!titleElement) {
                        titleElement = document.createElement('title');
                        document.head.appendChild(titleElement);
                    }
                    titleElement.textContent = title;
                }
            }["useSEO.useEffect.updateTitle"];
            // Helper function to update or create link tag
            const updateLinkTag = {
                "useSEO.useEffect.updateLinkTag": (rel, href, hreflang)=>{
                    const selector = hreflang ? 'link[rel="'.concat(rel, '"][hreflang="').concat(hreflang, '"]') : 'link[rel="'.concat(rel, '"]');
                    let element = document.querySelector(selector);
                    if (element) {
                        element.setAttribute('href', href);
                    } else {
                        element = document.createElement('link');
                        element.setAttribute('rel', rel);
                        element.setAttribute('href', href);
                        if (hreflang) {
                            element.setAttribute('hreflang', hreflang);
                        }
                        document.head.appendChild(element);
                    }
                }
            }["useSEO.useEffect.updateLinkTag"];
            // Update title first
            updateTitle(seoData.title);
            // Basic meta tags
            updateMetaTag('description', seoData.description);
            updateMetaTag('language', language);
            // Open Graph tags
            updateMetaTag('og:title', seoData.title, true);
            updateMetaTag('og:description', seoData.description, true);
            updateMetaTag('og:type', seoData.type || 'website', true);
            updateMetaTag('og:locale', language === 'fr' ? 'fr_FR' : 'en_US', true);
            updateMetaTag('og:site_name', 'Webtmize', true);
            if (seoData.image) {
                updateMetaTag('og:image', seoData.image, true);
                updateMetaTag('og:image:alt', seoData.title, true);
                updateMetaTag('og:image:width', '1200', true);
                updateMetaTag('og:image:height', '630', true);
            }
            if (seoData.url) {
                updateMetaTag('og:url', seoData.url, true);
            }
            // Twitter Card tags
            updateMetaTag('twitter:card', 'summary_large_image');
            updateMetaTag('twitter:site', '@webtmize');
            updateMetaTag('twitter:title', seoData.title);
            updateMetaTag('twitter:description', seoData.description);
            if (seoData.image) {
                updateMetaTag('twitter:image', seoData.image);
            }
            // Article-specific meta tags
            if (seoData.type === 'article') {
                if (seoData.author) {
                    updateMetaTag('article:author', seoData.author, true);
                }
                if (seoData.publishedTime) {
                    updateMetaTag('article:published_time', seoData.publishedTime, true);
                }
                if (seoData.modifiedTime) {
                    updateMetaTag('article:modified_time', seoData.modifiedTime, true);
                }
            }
            // Canonical URL and hreflang
            if (seoData.url) {
                updateLinkTag('canonical', seoData.url);
                const baseUrl = seoData.url.split('?')[0];
                updateLinkTag('alternate', baseUrl, 'en');
                updateLinkTag('alternate', baseUrl, 'fr');
                updateLinkTag('alternate', seoData.url, 'x-default');
            }
            // Handle structured data
            if (seoData.structuredData) {
                const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
                existingScripts.forEach({
                    "useSEO.useEffect": (script)=>script.remove()
                }["useSEO.useEffect"]);
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                const jsonData = Array.isArray(seoData.structuredData) ? seoData.structuredData : seoData.structuredData;
                script.textContent = JSON.stringify(jsonData, null, 2);
                document.head.appendChild(script);
            }
            // Additional SEO tags
            updateMetaTag('robots', 'index, follow');
            updateMetaTag('googlebot', 'index, follow');
            updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        }
    }["useSEO.useEffect"], [
        seoData,
        language
    ]);
};
_s(useSEO, "bQmhoTNnUKBArwEgsVQiWN7+tZA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useLanguage"]
    ];
});
const generateOrganizationSchema = (language)=>({
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
    });
const generateWebsiteSchema = (language)=>({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Webtmize",
        "description": language === 'fr' ? "Agence de marketing digital spécialisée dans l'e-commerce et SaaS" : "Digital marketing agency specialized in e-commerce and SaaS",
        "url": "https://webascendio.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://webascendio.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    });
const generateArticleSchema = (caseStudy, language)=>({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": caseStudy.title[language],
        "description": caseStudy.description[language],
        "image": caseStudy.image,
        "author": {
            "@type": "Organization",
            "name": "Webtmize"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Webtmize",
            "logo": {
                "@type": "ImageObject",
                "url": "https://webascendio.com/logo.png"
            }
        },
        "datePublished": "2024-01-01",
        "dateModified": "2024-12-01",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://webascendio.com/case-studies/".concat(caseStudy.id)
        },
        "about": {
            "@type": "Thing",
            "name": caseStudy.industry[language]
        }
    });
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
"[project]/src/components/marketing-agency-website.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.4.6_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@10.18.0_react_39718d184a546e7029955c4644d61736/node_modules/framer-motion/dist/es/render/dom/motion.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/framer-motion@10.18.0_react_39718d184a546e7029955c4644d61736/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/arrow-right.js [client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/check-circle.js [client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/globe.js [client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/menu.js [client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/x.js [client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bar$2d$chart$2d$3$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/bar-chart-3.js [client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/target.js [client] (ecmascript) <export default as Target>");
// Import shadcn/ui components
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$flip$2d$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/flip-card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$language$2d$switcher$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/language-switcher.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$theme$2d$toggle$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/theme-toggle.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useSEO$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useSEO.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$voiceflow$2d$chat$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/voiceflow-chat.tsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
// Main Marketing Agency Website Component
const MarketingAgencyWebsite = ()=>{
    _s();
    const { t, language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    const [isMenuOpen, setIsMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // SEO Implementation
    const seoData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "MarketingAgencyWebsite.useMemo[seoData]": ()=>({
                title: language === 'fr' ? 'Agence Marketing Digital Spécialisée E-commerce & SaaS | Webtmize' : 'Digital Marketing Agency for E-commerce & SaaS Growth | Webtmize',
                description: language === 'fr' ? 'Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble avec nos stratégies éprouvées.' : 'Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let\'s grow together with proven strategies.',
                url: 'https://webtimize.ca/',
                type: 'website',
                image: 'https://webtimize.ca/og-image.jpg',
                structuredData: [
                    {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Webtmize",
                        "description": language === 'fr' ? "Webtmize offre des solutions marketing à haut ROI pour les marques e-commerce et SaaS. Grandissons ensemble." : "Webtmize delivers high-ROI marketing solutions for e-commerce and SaaS brands. Let's grow together.",
                        "url": "https://webtimize.ca",
                        "logo": "https://webtimize.ca/logo.png",
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": language === 'fr' ? "+33 1 23 45 67 89" : "+1 (555) 123-4567",
                            "contactType": "customer service",
                            "email": "hello@webtmize.com"
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
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "Webtmize",
                        "description": language === 'fr' ? "Agence de marketing digital spécialisée dans l'e-commerce et SaaS" : "Digital marketing agency specialized in e-commerce and SaaS",
                        "url": "https://webtimize.ca",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://webtimize.ca/search?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    }
                ]
            })
    }["MarketingAgencyWebsite.useMemo[seoData]"], [
        language
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useSEO$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useSEO"])(seoData);
    // Navigation items
    const navItems = [
        {
            label: t('nav.services'),
            href: '#services'
        },
        {
            label: t('nav.caseStudies'),
            href: '/case-studies',
            isLink: true
        },
        {
            label: t('nav.blog'),
            href: '/blog',
            isLink: true
        },
        {
            label: t('nav.contact'),
            href: '#contact'
        }
    ];
    // Services data for 3D cards
    const services = [
        {
            id: "performance-marketing",
            title: t('services.performance.title'),
            description: t('services.performance.description'),
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                className: "w-8 h-8"
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 101,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            id: "seo-content",
            title: t('services.seo.title'),
            description: t('services.seo.description'),
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                className: "w-8 h-8"
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 107,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            id: "growth-analytics",
            title: t('services.analytics.title'),
            description: t('services.analytics.description'),
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bar$2d$chart$2d$3$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                className: "w-8 h-8"
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 113,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        }
    ];
    // Animation variants
    const fadeInUp = {
        hidden: {
            opacity: 0,
            y: 60
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [
                    0.23,
                    0.86,
                    0.39,
                    0.96
                ]
            }
        }
    };
    const staggerContainer = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-blue-100 dark:border-gray-700 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between h-16",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        x: -20
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    className: "text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent",
                                    children: "Webtmize"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hidden md:flex items-center space-x-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$theme$2d$toggle$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 154,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$language$2d$switcher$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 155,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        navItems.map((item, index)=>{
                                            if (item.isLink) {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    initial: {
                                                        opacity: 0,
                                                        y: -10
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0
                                                    },
                                                    transition: {
                                                        delay: index * 0.1
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: item.href,
                                                        className: "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                        lineNumber: 165,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, item.label, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 159,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0));
                                            }
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].a, {
                                                href: item.href,
                                                initial: {
                                                    opacity: 0,
                                                    y: -10
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0
                                                },
                                                transition: {
                                                    delay: index * 0.1
                                                },
                                                className: "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                                children: item.label
                                            }, item.label, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 175,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0));
                                        }),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                            className: "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white cursor-pointer",
                                                onClick: ()=>{
                                                    if (window.voiceflow && window.voiceflow.chat) {
                                                        window.voiceflow.chat.open();
                                                    }
                                                },
                                                children: "🤖 Book Your Call with AI"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 188,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 187,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 153,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "md:hidden text-white",
                                    onClick: ()=>setIsMenuOpen(!isMenuOpen),
                                    children: isMenuOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-6 h-6"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                        lineNumber: 206,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                        className: "w-6 h-6"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                        lineNumber: 206,
                                        columnNumber: 57
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 202,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                            lineNumber: 143,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                            children: isMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    height: 0
                                },
                                animate: {
                                    opacity: 1,
                                    height: 'auto'
                                },
                                exit: {
                                    opacity: 0,
                                    height: 0
                                },
                                className: "md:hidden border-t border-blue-100 dark:border-gray-700",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "py-4 space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$theme$2d$toggle$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 220,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$language$2d$switcher$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 221,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        navItems.map((item)=>{
                                            if (item.isLink) {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: item.href,
                                                    className: "block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                                    onClick: ()=>setIsMenuOpen(false),
                                                    children: item.label
                                                }, item.label, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 225,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0));
                                            }
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: item.href,
                                                className: "block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                                onClick: ()=>setIsMenuOpen(false),
                                                children: item.label
                                            }, item.label, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 236,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0));
                                        }),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                            className: "w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900",
                                            onClick: ()=>{
                                                if (window.voiceflow && window.voiceflow.chat) {
                                                    window.voiceflow.chat.open();
                                                }
                                                setIsMenuOpen(false);
                                            },
                                            children: "🤖 Book Your Call with AI"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 246,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 219,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                lineNumber: 213,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                            lineNumber: 211,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                    lineNumber: 142,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 141,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "pt-24 pb-20 px-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: "visible",
                        variants: staggerContainer,
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].h1, {
                                variants: fadeInUp,
                                className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-700 dark:from-gray-100 dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-relaxed py-4",
                                children: t('hero.title').split('\n').map((line, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            index === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-gray-900 dark:text-gray-100",
                                                children: line
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 280,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-blue-600 dark:text-blue-400",
                                                children: line
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 282,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            index === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 284,
                                                columnNumber: 35
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                        lineNumber: 278,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                lineNumber: 273,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                variants: fadeInUp,
                                className: "text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed",
                                children: t('hero.subtitle')
                            }, void 0, false, {
                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                lineNumber: 289,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: fadeInUp,
                                className: "flex flex-col sm:flex-row gap-4 justify-center items-center mb-12",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                    size: "lg",
                                    onClick: ()=>{
                                        if (window.voiceflow && window.voiceflow.chat) {
                                            window.voiceflow.chat.open();
                                        }
                                    },
                                    className: "bg-gradient-to-r from-blue-600 to-blue-800 text-white text-lg px-8 py-4 hover:from-blue-700 hover:to-blue-900",
                                    children: "🤖 Book Your Call with AI"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 300,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                lineNumber: 296,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: fadeInUp,
                                className: "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto",
                                children: [
                                    {
                                        metric: "40+",
                                        label: t('hero.metric1')
                                    },
                                    {
                                        metric: "2000+",
                                        label: t('hero.metric2')
                                    },
                                    {
                                        metric: "40M$",
                                        label: t('hero.metric3')
                                    }
                                ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2",
                                                children: item.metric
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 324,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-gray-700 dark:text-gray-300",
                                                children: item.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 325,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, item.metric, true, {
                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                        lineNumber: 323,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                lineNumber: 314,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                        lineNumber: 267,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                    lineNumber: 266,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 265,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                id: "services",
                className: "py-20 px-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: "hidden",
                            whileInView: "visible",
                            viewport: {
                                once: true
                            },
                            variants: staggerContainer,
                            className: "text-center mb-16",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    variants: fadeInUp,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "outline",
                                        className: "mb-4",
                                        children: t('services.badge')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                        lineNumber: 344,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 343,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].h2, {
                                    variants: fadeInUp,
                                    className: "text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100",
                                    children: t('services.title')
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 346,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                    variants: fadeInUp,
                                    className: "text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto",
                                    children: t('services.subtitle')
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 352,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                            lineNumber: 336,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: "hidden",
                            whileInView: "visible",
                            viewport: {
                                once: true
                            },
                            variants: staggerContainer,
                            className: "max-w-7xl mx-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
                                children: services.map((service)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: fadeInUp,
                                        className: "h-80",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$flip$2d$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["FlipCard"], {
                                            className: "h-full w-full",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$flip$2d$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["FlipCardFront"], {
                                                    className: "rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-xl",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex h-full flex-col justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mb-6 text-blue-100",
                                                                children: service.icon
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                lineNumber: 377,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "mb-4 text-2xl font-bold text-white",
                                                                        children: service.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                        lineNumber: 381,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-blue-100 leading-relaxed",
                                                                        children: service.description
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                        lineNumber: 384,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                lineNumber: 380,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                        lineNumber: 376,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 375,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$flip$2d$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["FlipCardBack"], {
                                                    className: "rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 p-8 text-white shadow-xl",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex h-full flex-col justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "mb-6 text-2xl font-bold text-white",
                                                                        children: service.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                        lineNumber: 393,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-4",
                                                                        children: [
                                                                            service.id === 'performance-marketing' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 400,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.performance.features.googleAds')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 401,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 399,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 404,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.performance.features.targeting')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 405,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 403,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 408,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.performance.features.roi')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 409,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 407,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 412,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.performance.features.tracking')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 413,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 411,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                                ]
                                                                            }, void 0, true),
                                                                            service.id === 'seo-content' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 420,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.seo.features.audits')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 421,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 419,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 424,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.seo.features.content')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 425,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 423,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 428,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.seo.features.development')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 429,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 427,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 432,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.seo.features.mobile')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 433,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 431,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                                ]
                                                                            }, void 0, true),
                                                                            service.id === 'growth-analytics' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 440,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.analytics.features.setup')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 441,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 439,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 444,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.analytics.features.dashboards')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 445,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 443,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 448,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.analytics.features.cro')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 449,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 447,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$circle$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                className: "w-5 h-5 text-green-400"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 452,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-gray-200",
                                                                                                children: t('services.analytics.features.insights')
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                                lineNumber: 453,
                                                                                                columnNumber: 35
                                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                                        lineNumber: 451,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                                ]
                                                                            }, void 0, true)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                        lineNumber: 396,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                lineNumber: 392,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-6",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                    className: "w-full bg-blue-600 hover:bg-blue-700 text-white",
                                                                    onClick: ()=>{
                                                                        var _document_getElementById;
                                                                        return (_document_getElementById = document.getElementById('contact')) === null || _document_getElementById === void 0 ? void 0 : _document_getElementById.scrollIntoView({
                                                                            behavior: 'smooth'
                                                                        });
                                                                    },
                                                                    children: [
                                                                        t('services.learnMore'),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$303$2e$0_react$40$18$2e$3$2e$1$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                                            className: "ml-2 w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                            lineNumber: 465,
                                                                            columnNumber: 29
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                    lineNumber: 460,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                                lineNumber: 459,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                        lineNumber: 391,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 390,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 374,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, service.id, false, {
                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                        lineNumber: 369,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                lineNumber: 367,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                            lineNumber: 360,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                    lineNumber: 335,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 334,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                id: "contact",
                className: "py-20 px-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: "hidden",
                            whileInView: "visible",
                            viewport: {
                                once: true
                            },
                            variants: staggerContainer,
                            className: "text-center mb-16",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    variants: fadeInUp,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "outline",
                                        className: "mb-4",
                                        children: t('contact.badge')
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                        lineNumber: 489,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 488,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].h2, {
                                    variants: fadeInUp,
                                    className: "text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100",
                                    children: t('contact.title')
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 491,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                    variants: fadeInUp,
                                    className: "text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto",
                                    children: t('contact.subtitle')
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 497,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                            lineNumber: 481,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 lg:grid-cols-2 gap-12",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$framer$2d$motion$40$10$2e$18$2e$0_react_39718d184a546e7029955c4644d61736$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$dom$2f$motion$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    x: -50
                                },
                                whileInView: {
                                    opacity: 1,
                                    x: 0
                                },
                                viewport: {
                                    once: true
                                },
                                className: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-2xl p-8 lg:col-span-2 max-w-2xl mx-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-8",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-10 h-10 text-white",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 2,
                                                            d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                            lineNumber: 517,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                        lineNumber: 516,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100",
                                                    children: "Book Your Call with AI Assistant"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 520,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg text-gray-700 dark:text-gray-300 mb-8",
                                                    children: "Chat with our AI assistant to instantly book a consultation call. Get personalized recommendations and schedule your free marketing audit in minutes."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 514,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                            size: "lg",
                                            onClick: ()=>{
                                                if (window.voiceflow && window.voiceflow.chat) {
                                                    window.voiceflow.chat.open();
                                                }
                                            },
                                            className: "bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-8 py-4 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105",
                                            children: "🤖 Chat with AI Assistant"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 526,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-6 text-sm text-gray-600 dark:text-gray-400",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "🤖 Instant responses • 📅 Easy booking • ✨ Personalized recommendations"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                lineNumber: 539,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 538,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 513,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/marketing-agency-website.tsx",
                                lineNumber: 507,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                            lineNumber: 505,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                    lineNumber: 480,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 479,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-gray-700 py-12 px-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-8 mb-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4",
                                            children: "Webtmize"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 553,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-700 dark:text-gray-300 mb-4",
                                            children: t('footer.description')
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 556,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 552,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "font-semibold mb-4 text-gray-900 dark:text-gray-100",
                                            children: t('footer.company')
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 562,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2 text-sm text-gray-700 dark:text-gray-300",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                                        children: t('footer.about')
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                        lineNumber: 564,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 564,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                                        children: t('footer.caseStudies')
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                        lineNumber: 565,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 565,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                                        children: t('footer.blog')
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                        lineNumber: 566,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 566,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        className: "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                                        children: t('footer.careers')
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                        lineNumber: 567,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                                    lineNumber: 567,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 563,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 561,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                            lineNumber: 551,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-blue-100 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-700 dark:text-gray-300",
                                    children: t('footer.copyright')
                                }, void 0, false, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 573,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex space-x-6 text-sm text-gray-700 dark:text-gray-300 mt-4 md:mt-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#",
                                            className: "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                            children: t('footer.privacy')
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 577,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#",
                                            className: "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                            children: t('footer.terms')
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 578,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#",
                                            className: "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                                            children: t('footer.cookies')
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                                            lineNumber: 579,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                                    lineNumber: 576,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/marketing-agency-website.tsx",
                            lineNumber: 572,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/marketing-agency-website.tsx",
                    lineNumber: 550,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 549,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$voiceflow$2d$chat$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                autoLoad: true
            }, void 0, false, {
                fileName: "[project]/src/components/marketing-agency-website.tsx",
                lineNumber: 586,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/marketing-agency-website.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(MarketingAgencyWebsite, "qhimPdvOvVr2Hs89jn9gionfIG0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useLanguage"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useSEO$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useSEO"]
    ];
});
_c = MarketingAgencyWebsite;
const __TURBOPACK__default__export__ = MarketingAgencyWebsite;
var _c;
__turbopack_context__.k.register(_c, "MarketingAgencyWebsite");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/pages/index.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Home
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$marketing$2d$agency$2d$website$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/marketing-agency-website.tsx [client] (ecmascript)");
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$40$18$2e$3$2e$1$2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$marketing$2d$agency$2d$website$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/pages/index.tsx",
        lineNumber: 4,
        columnNumber: 10
    }, this);
}
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/index.tsx [client] (ecmascript)\" } [client] (ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/index.tsx [client] (ecmascript)");
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
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/index\" }": ((__turbopack_context__) => {
"use strict";

var { m: module } = __turbopack_context__;
{
__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/index.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__e3a125e5._.js.map