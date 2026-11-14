declare const __APP_VERSION__: string;
declare const __REPO_URL__: string;

declare module 'virtual:api-docs' {
  const docs: import('./docs/api-docs.types').ApiDocs;
  export default docs;
}
