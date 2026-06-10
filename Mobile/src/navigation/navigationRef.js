// Shared navigation ref — used by components outside the navigator tree
// (e.g. MainTabs which IS the root Tab navigator and has no parent navigator,
// or service-layer code that needs to navigate without a React component context)
export const appNavigationRef = { current: null };
