import type { Plugin } from 'vite';
import { DOCS_SOURCES, generateApiDocs } from './api-docs';

const VIRTUAL_ID = 'virtual:api-docs';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/**
 * Serves the component's API surface as a module, regenerated from the TypeScript
 * source on every build and on every edit of a documented file.
 */
export function apiDocs(): Plugin {
  let moduleText: Promise<string> | undefined;

  const loadModule = () => {
    moduleText ??= generateApiDocs().then((docs) => `export default ${JSON.stringify(docs)};\n`);
    return moduleText;
  };

  return {
    name: 'collagefab-api-docs',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    async load(id) {
      return id === RESOLVED_ID ? loadModule() : undefined;
    },
    configureServer(server) {
      server.watcher.add(DOCS_SOURCES);
    },
    handleHotUpdate({ file, server }) {
      if (!DOCS_SOURCES.includes(file)) {
        return;
      }
      moduleText = undefined;
      const module = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (module) {
        server.moduleGraph.invalidateModule(module);
      }
      server.ws.send({ type: 'full-reload' });
    },
  };
}
