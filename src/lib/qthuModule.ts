import {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export interface PipelineResult {
  ast: string;
  hir: string;
  lin: string;
  cthu: string;
  bytecode: string;
  runOutput: string;
  stage: string;
  error: string;
}

export interface QthuWasmModule {
  compile(source: string): PipelineResult;
}

type ModuleFactory = (opts?: {
  locateFile?: (path: string) => string;
}) => Promise<QthuWasmModule>;

export function useQthuModule(): {
  module: QthuWasmModule | null;
  ready: boolean;
  loadError: string | null;
} {
  const wasmJsUrl = useBaseUrl('/wasm/qthu-wasm.js');
  const wasmDirUrl = useBaseUrl('/wasm/');

  const moduleRef = useRef<QthuWasmModule | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    import(/* webpackIgnore: true */ wasmJsUrl)
      .then((mod) => {
        const factory = mod.default as ModuleFactory;
        return factory({locateFile: (path) => wasmDirUrl + path});
      })
      .then((qthuModule) => {
        if (cancelled) return;
        moduleRef.current = qthuModule;
        setReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {module: moduleRef.current, ready, loadError};
}
