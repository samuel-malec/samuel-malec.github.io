import {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export interface CompileResult {
  tokens: string;
  ast: string;
  hir: string;
  ir: string;
  cfg: string;
  stage: string;
  error: string;
}

export interface OptimizeResult {
  before: string;
  after: string;
  stage: string;
  error: string;
}

export interface CompilerWasmModule {
  compile(source: string): CompileResult;
  optimize(
    source: string,
    enableSccp: boolean,
    enableDce: boolean,
    enableSimplifyCfg: boolean,
  ): OptimizeResult;
}

type ModuleFactory = (opts?: {
  locateFile?: (path: string) => string;
}) => Promise<CompilerWasmModule>;

export function useCompilerModule(): {
  module: CompilerWasmModule | null;
  ready: boolean;
  loadError: string | null;
} {
  const wasmJsUrl = useBaseUrl('/wasm/compiler-dungeon-wasm.js');
  const wasmDirUrl = useBaseUrl('/wasm/');

  const moduleRef = useRef<CompilerWasmModule | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    import(/* webpackIgnore: true */ wasmJsUrl)
      .then((mod) => {
        const factory = mod.default as ModuleFactory;
        return factory({locateFile: (path) => wasmDirUrl + path});
      })
      .then((compilerModule) => {
        if (cancelled) return;
        moduleRef.current = compilerModule;
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
