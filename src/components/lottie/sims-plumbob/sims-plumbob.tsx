import { createRef, useLayoutEffect } from 'react';
import lazyLottie from '../../../utils/lazy-lottie.ts';

export function SimsPlumbob() {
  const ref = createRef<HTMLElement>();

  useLayoutEffect(() => {
    if (ref.current) {
      const animation = lazyLottie.loadAnimation({
        container: ref.current,
        path: new URL('./sims-plumbob.json', import.meta.url).href,
      });

      return () => {
        animation?.destroy();
      };
    }
  }, []);

  return (
    <div
      // @ts-ignore
      ref={ref}
    />
  );
}
