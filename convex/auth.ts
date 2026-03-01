import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { buildUserSearchText } from "./users/model";

type AuthProfile = {
  email?: string;
  emailVerified?: boolean;
  image?: string;
  isAnonymous?: boolean;
  name?: string;
  phone?: string;
  phoneVerified?: boolean;
};

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function getOptionalBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

async function uniqueUserWithVerifiedEmail(ctx: MutationCtx, email: string) {
  const users = await ctx.db
    .query("users")
    .withIndex("email", (query) => query.eq("email", email))
    .filter((query) => query.neq(query.field("emailVerificationTime"), undefined))
    .take(2);

  return users.length === 1 ? users[0] : null;
}

async function uniqueUserWithVerifiedPhone(ctx: MutationCtx, phone: string) {
  const users = await ctx.db
    .query("users")
    .withIndex("phone", (query) => query.eq("phone", phone))
    .filter((query) => query.neq(query.field("phoneVerificationTime"), undefined))
    .take(2);

  return users.length === 1 ? users[0] : null;
}

function buildUserData(
  profile: AuthProfile,
  options: {
    emailVerified: boolean;
    existingUser?: Doc<"users"> | null;
    phoneVerified: boolean;
  },
) {
  const nextName = options.existingUser?.name ?? normalizeOptionalString(profile.name);
  const nextEmail =
    normalizeOptionalString(profile.email) ?? options.existingUser?.email;
  const nextPhone =
    normalizeOptionalString(profile.phone) ?? options.existingUser?.phone;
  const nextImage =
    normalizeOptionalString(profile.image) ?? options.existingUser?.image;
  const nextIsAnonymous =
    getOptionalBoolean(profile.isAnonymous) ?? options.existingUser?.isAnonymous;
  const nextBio = options.existingUser?.bio;

  const userData: Partial<Doc<"users">> = {
    searchText: buildUserSearchText({
      name: nextName,
      bio: nextBio,
      email: nextEmail,
    }),
  };

  if (nextName !== undefined) {
    userData.name = nextName;
  }

  if (nextEmail !== undefined) {
    userData.email = nextEmail;
  }

  if (nextPhone !== undefined) {
    userData.phone = nextPhone;
  }

  if (nextImage !== undefined) {
    userData.image = nextImage;
  }

  if (nextIsAnonymous !== undefined) {
    userData.isAnonymous = nextIsAnonymous;
  }

  if (options.emailVerified) {
    userData.emailVerificationTime = Date.now();
  }

  if (options.phoneVerified) {
    userData.phoneVerificationTime = Date.now();
  }

  return userData;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const profile = args.profile as AuthProfile;
      const emailVerified =
        profile.emailVerified ??
        ((args.provider.type === "oauth" || args.provider.type === "oidc") &&
          args.provider.allowDangerousEmailAccountLinking !== false);
      const phoneVerified = profile.phoneVerified ?? false;
      const shouldLinkViaEmail =
        ("shouldLinkViaEmail" in args &&
          Boolean(
            (args as { shouldLinkViaEmail?: boolean }).shouldLinkViaEmail,
          )) ||
        emailVerified ||
        args.provider.type === "email";
      const shouldLinkViaPhone =
        ("shouldLinkViaPhone" in args &&
          Boolean(
            (args as { shouldLinkViaPhone?: boolean }).shouldLinkViaPhone,
          )) ||
        phoneVerified ||
        args.provider.type === "phone";

      let userId = args.existingUserId;

      if (userId === null) {
        const existingUserWithVerifiedEmailId =
          typeof profile.email === "string" && shouldLinkViaEmail
            ? (await uniqueUserWithVerifiedEmail(ctx, profile.email))?._id ?? null
            : null;
        const existingUserWithVerifiedPhoneId =
          typeof profile.phone === "string" && shouldLinkViaPhone
            ? (await uniqueUserWithVerifiedPhone(ctx, profile.phone))?._id ?? null
            : null;

        if (
          existingUserWithVerifiedEmailId !== null &&
          existingUserWithVerifiedPhoneId !== null
        ) {
          userId = null;
        } else if (existingUserWithVerifiedEmailId !== null) {
          userId = existingUserWithVerifiedEmailId;
        } else if (existingUserWithVerifiedPhoneId !== null) {
          userId = existingUserWithVerifiedPhoneId;
        }
      }

      const existingUser = userId !== null ? await ctx.db.get(userId) : null;
      const userData = buildUserData(profile, {
        emailVerified,
        existingUser,
        phoneVerified,
      });

      if (existingUser?._id) {
        await ctx.db.patch(existingUser._id, userData);
        return existingUser._id;
      }

      return await ctx.db.insert("users", userData);
    },
  },
});
