// "Modo dono": the owner unlocks add/edit/delete with a password kept on the server.
// The unlocked flag lives in an encrypted, httpOnly session cookie.
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type OwnerSession = { owner?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "colecionador-dono",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

/** Constant-time comparison of equal-length digests. */
async function passwordMatches(input: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([sha256(input), sha256(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export const getOwnerStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<OwnerSession>(sessionConfig());
  return { owner: session.data.owner === true };
});

export const unlockOwner = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({ password: String(data?.password ?? "").slice(0, 200) }))
  .handler(async ({ data }) => {
    const expected = process.env["OWNER_PASSWORD"];
    if (!expected || !(await passwordMatches(data.password, expected))) return { ok: false as const };
    const session = await useSession<OwnerSession>(sessionConfig());
    await session.update({ owner: true });
    return { ok: true as const };
  });

export const lockOwner = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<OwnerSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});
