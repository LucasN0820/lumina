import { createClerkClient, verifyToken } from '@clerk/backend';

export type AuthenticatedClerkUser = {
  clerkUserId: string;
};

export type ClerkUserProfile = AuthenticatedClerkUser & {
  avatarUrl: string | null;
  email: string | null;
  googleSubject: string | null;
  nickname: string | null;
};

export type ClerkAuthService = {
  getUser(clerkUserId: string): Promise<ClerkUserProfile>;
  verifyToken(token: string): Promise<AuthenticatedClerkUser>;
};

export type CreateClerkAuthServiceOptions = {
  secretKey?: string;
};

type ClerkUserResource = {
  externalAccounts?: Array<{
    provider: string;
    providerUserId: string | null;
  }>;
  firstName?: string | null;
  id: string;
  imageUrl?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  username?: string | null;
};

/**
 * Creates the narrow Clerk boundary used by request middleware and local-user
 * synchronization. Keeping it behind this interface lets route tests avoid
 * both real Clerk credentials and network calls.
 */
export function createClerkAuthService({
  secretKey,
}: CreateClerkAuthServiceOptions = {}): ClerkAuthService {
  const client = secretKey ? createClerkClient({ secretKey }) : undefined;

  return {
    async verifyToken(token) {
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY is not configured.');
      }

      const claims = await verifyToken(token, { secretKey });
      if (!claims.sub) {
        throw new Error('Clerk token does not contain a user subject.');
      }

      return { clerkUserId: claims.sub };
    },
    async getUser(clerkUserId) {
      if (!client) {
        throw new Error('CLERK_SECRET_KEY is not configured.');
      }

      const user = (await client.users.getUser(clerkUserId)) as ClerkUserResource;
      return toClerkUserProfile(user);
    },
  };
}

function toClerkUserProfile(user: ClerkUserResource): ClerkUserProfile {
  const googleAccount = user.externalAccounts?.find((account) =>
    account.provider.toLowerCase().includes('google'),
  );
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return {
    avatarUrl: user.imageUrl ?? null,
    clerkUserId: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    googleSubject: googleAccount?.providerUserId ?? null,
    nickname: user.username ?? (fullName || null),
  };
}
