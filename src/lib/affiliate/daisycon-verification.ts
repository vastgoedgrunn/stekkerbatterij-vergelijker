import { clientEnv } from "@/lib/env/client";

/** Daisycon publisher media-verificatie (metatag in <head>). */
export function getDaisyconMetaVerification():
  | { name: string; content: string }
  | null {
  const content = clientEnv.NEXT_PUBLIC_DAISYCON_VERIFY_CONTENT;
  if (!content) return null;
  return {
    name: clientEnv.NEXT_PUBLIC_DAISYCON_VERIFY_NAME ?? "daisycon-site-verification",
    content,
  };
}
