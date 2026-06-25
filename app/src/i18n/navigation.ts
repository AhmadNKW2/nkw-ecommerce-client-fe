import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';
import { useLoading } from '@/components/ui/global-loader';

const { Link, redirect, usePathname, useRouter: useBaseRouter, getPathname } =
  createNavigation(routing);

export { Link, redirect, usePathname, getPathname, useBaseRouter };

export function useRouter() {
  const router = useBaseRouter();
  const { startLoading } = useLoading();

  const push = (href: string, options?: Parameters<typeof router.push>[1]) => {
    startLoading();
    router.push(href, options);
  };

  const replace = (href: string, options?: Parameters<typeof router.replace>[1]) => {
    startLoading();
    router.replace(href, options);
  };

  return { 
    ...router, 
    push, 
    replace 
  };
}
