/// <reference types="vite/client" />

declare module 'virtual:api-docs' {
  const docs: import('./docs/api-docs.types').ApiDocs;
  export default docs;
}
