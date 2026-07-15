import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-primary text-sm font-semibold">404</p>
      <h1 className="text-2xl font-semibold">Pagina niet gevonden</h1>
      <p className="text-muted-foreground">De pagina die je zoekt bestaat niet of is verplaatst.</p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
      >
        Terug naar home
      </Link>
    </main>
  );
}
