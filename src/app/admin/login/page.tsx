import { Button } from "@/components/ui/Button";
import { login } from "@/app/admin/login/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = params.error;
  const setup = params.setup;

  return (
    <main className="grid min-h-screen place-items-center bg-green px-5">
      <form action={login} className="w-full max-w-md rounded-lg bg-cream p-8 shadow-xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">
          City View Admin
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">Log in</h1>
        {setup && (
          <p className="mt-4 rounded-md bg-gold/20 p-3 text-sm text-ink">
            Supabase environment variables are missing.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-md bg-terracotta/15 p-3 text-sm text-ink">
            Could not log you in. Check your account and admin role.
          </p>
        )}
        <label className="mt-6 block text-sm font-semibold text-ink">
          Email
          <input
            className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
            name="email"
            type="email"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-ink">
          Password
          <input
            className="mt-2 w-full rounded-md border border-ink/10 px-3 py-3"
            name="password"
            type="password"
            required
          />
        </label>
        <Button type="submit" className="mt-6 w-full">
          Log In
        </Button>
      </form>
    </main>
  );
}
