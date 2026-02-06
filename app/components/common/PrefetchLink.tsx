"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface PrefetchLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * Link component với prefetch khi hover
 * Kiểm soát chặt chẽ hơn - chỉ prefetch khi user hover
 */
export default function PrefetchLink({ href, children, className, ...props }: PrefetchLinkProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={() => {

        router.prefetch(href);
      }}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}
