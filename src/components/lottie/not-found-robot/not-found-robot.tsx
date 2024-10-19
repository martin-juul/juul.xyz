import { createRef, useLayoutEffect } from 'react';
import lazyLottie from '../../../utils/lazy-lottie.ts';

export function NotFoundRobot() {
  const ref = createRef<HTMLElement>();

  useLayoutEffect(() => {
    if (ref.current) {
      const animation = lazyLottie.loadAnimation({
        container: ref.current,
        path: new URL('./not-found-robot.json', import.meta.url).href,
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
