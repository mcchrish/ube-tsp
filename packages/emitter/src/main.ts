export { $onEmit } from './emitter.jsx';
export * from './testing/index.js';

import * as Spec from './spec/Spec.js';

export function createClient<
  T extends {
    OperationMap: {
      request: unknown;
      response: unknown;
    };
  },
>(param: (s: T) => void, s: T): void {
  param(s);
}

createClient<typeof Spec>((s) => {}, Spec);
