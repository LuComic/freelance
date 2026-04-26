"use client";

import { api } from "@/convex/_generated/api";
import {
  clearStoredGuestUpgradeToken,
  getStoredGuestUpgradeToken,
} from "@/app/lib/guestUpgrade";
import { SearchBarProvider } from "@/app/lib/components/searchbar/SearchBarContext";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getProjectPagePath,
  getProjectPath,
} from "@/app/lib/components/project/paths";
import { MAX_NAME_LENGTH } from "@/lib/inputLimits";

const CreateProjectModal = dynamic(
  () =>
    import("@/app/lib/components/project/CreateProjectModal").then(
      (module) => module.CreateProjectModal,
    ),
  { ssr: false },
);

const SearchBar = dynamic(
  () =>
    import("@/app/lib/components/searchbar/SearchBar").then(
      (module) => module.SearchBar,
    ),
  { ssr: false },
);

type JoinTarget = {
  joinCode: string;
  projectId: string;
  projectName: string;
  firstPageId: string | null;
  redirectPath: string;
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convex = useConvex();
  const { isLoading: isAuthLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const profile = useQuery(api.users.queries.currentProfile);
  const projects = useQuery(api.projects.queries.listCurrentUserProjects);
  const completeGuestUpgrade = useMutation(
    api.projects.join.completeGuestUpgrade,
  );
  const joinCurrentUserByCode = useMutation(
    api.projects.join.joinCurrentUserByCode,
  );
  const completedUpgradeTokenRef = useRef<string | null>(null);
  const attemptedLinkJoinCodeRef = useRef<string | null>(null);
  const [joinCodeDraft, setJoinCodeDraft] = useState("");
  const [guestNameDraft, setGuestNameDraft] = useState("");
  const [validatedJoinTarget, setValidatedJoinTarget] =
    useState<JoinTarget | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCompletingUpgrade, setIsCompletingUpgrade] = useState(false);
  const isAnonymous = profile?.isAnonymous === true;
  const isSignedInRealUser =
    profile !== undefined && profile !== null && profile.isAnonymous !== true;
  const didReturnFromGuestUpgrade =
    searchParams.get("betaUpgradeAttempt") === "google";
  const joinCodeFromLink = searchParams.get("joinCode");

  useEffect(() => {
    if (
      !didReturnFromGuestUpgrade ||
      isAuthLoading ||
      profile === undefined ||
      !profile?.isAnonymous
    ) {
      return;
    }

    void Promise.resolve().then(() => {
      setUpgradeError("This Google account is not approved for beta yet.");
    });
    router.replace("/projects");
  }, [didReturnFromGuestUpgrade, isAuthLoading, profile, router]);

  useEffect(() => {
    if (!profile || profile.isAnonymous) {
      return;
    }

    const storedToken = getStoredGuestUpgradeToken();

    if (!storedToken || completedUpgradeTokenRef.current === storedToken) {
      return;
    }

    completedUpgradeTokenRef.current = storedToken;
    setIsCompletingUpgrade(true);
    setUpgradeError(null);

    void completeGuestUpgrade({
      token: storedToken,
    })
      .then((result) => {
        clearStoredGuestUpgradeToken();
        router.replace(result.redirectPath);
        router.refresh();
      })
      .catch((error) => {
        clearStoredGuestUpgradeToken();
        completedUpgradeTokenRef.current = null;
        setUpgradeError(
          error instanceof Error
            ? error.message
            : "Could not link the guest project to this account.",
        );
      })
      .finally(() => {
        setIsCompletingUpgrade(false);
      });
  }, [completeGuestUpgrade, profile, router]);

  useEffect(() => {
    const trimmedJoinCode = joinCodeFromLink?.trim() ?? "";

    if (!trimmedJoinCode || isAuthLoading || profile === undefined) {
      return;
    }

    if (attemptedLinkJoinCodeRef.current === trimmedJoinCode) {
      return;
    }

    attemptedLinkJoinCodeRef.current = trimmedJoinCode;
    setJoinCodeDraft(trimmedJoinCode);

    if (isAnonymous) {
      setJoinError("This guest account is already tied to a project.");
      return;
    }

    setJoinError(null);

    if (isSignedInRealUser) {
      setIsJoining(true);

      void joinCurrentUserByCode({
        joinCode: trimmedJoinCode,
      })
        .then((result) => {
          router.replace(result.redirectPath);
          router.refresh();
        })
        .catch((error) => {
          setJoinError(
            error instanceof Error
              ? error.message
              : "Could not join this project.",
          );
        })
        .finally(() => {
          setIsJoining(false);
        });

      return;
    }

    setIsVerifyingCode(true);

    void convex
      .query(api.projects.join.validateJoinCode, {
        joinCode: trimmedJoinCode,
      })
      .then((result) => {
        if (!result) {
          setValidatedJoinTarget(null);
          setJoinError("That project code is not valid.");
          return;
        }

        setJoinCodeDraft(result.joinCode);
        setValidatedJoinTarget(result as JoinTarget);
        setGuestNameDraft("");
      })
      .catch((error) => {
        setJoinError(
          error instanceof Error
            ? error.message
            : "Could not validate that project code.",
        );
      })
      .finally(() => {
        setIsVerifyingCode(false);
      });
  }, [
    convex,
    isAnonymous,
    isAuthLoading,
    isSignedInRealUser,
    joinCurrentUserByCode,
    joinCodeFromLink,
    profile,
    router,
  ]);

  const handleJoinSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isAnonymous) {
      setJoinError("This guest account is already tied to a project.");
      return;
    }

    if (!validatedJoinTarget) {
      const trimmedJoinCode = joinCodeDraft.trim();

      if (!trimmedJoinCode || isVerifyingCode) {
        return;
      }

      setJoinError(null);
      setIsVerifyingCode(true);

      try {
        const result = await convex.query(api.projects.join.validateJoinCode, {
          joinCode: trimmedJoinCode,
        });

        if (!result) {
          setJoinError("That project code is not valid.");
          return;
        }

        setJoinCodeDraft(result.joinCode);

        if (isSignedInRealUser) {
          setIsJoining(true);

          try {
            const joinResult = await joinCurrentUserByCode({
              joinCode: result.joinCode,
            });

            router.replace(joinResult.redirectPath);
            router.refresh();
          } catch (error) {
            setJoinError(
              error instanceof Error
                ? error.message
                : "Could not join this project.",
            );
          } finally {
            setIsJoining(false);
          }

          return;
        }

        setValidatedJoinTarget(result as JoinTarget);
        setGuestNameDraft("");
      } catch (error) {
        setJoinError(
          error instanceof Error
            ? error.message
            : "Could not validate that project code.",
        );
      } finally {
        setIsVerifyingCode(false);
      }

      return;
    }

    const trimmedGuestName = guestNameDraft.trim();

    if (!trimmedGuestName || isJoining) {
      return;
    }

    setJoinError(null);
    setIsJoining(true);

    try {
      await signIn("projectGuest", {
        joinCode: validatedJoinTarget.joinCode,
        name: trimmedGuestName,
        redirectTo: validatedJoinTarget.redirectPath,
      });
      router.replace(validatedJoinTarget.redirectPath);
      router.refresh();
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : "Could not join this project.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <SearchBarProvider>
      <SearchBar />
      <div className="h-max md:max-w-2/3 mx-auto w-full flex flex-col gap-4 items-start justify-center">
        <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
          <p className="md:text-3xl text-xl font-medium">Welcome!</p>
        </div>

        <div className="flex lg:flex-row flex-col items-start lg:items-center justify-center gap-2">
          {isSignedInRealUser ? <CreateProjectModal ui="projects" /> : null}
          {isSignedInRealUser ? (
            <span className="text-(--gray-page) lg:inline hidden">or</span>
          ) : null}
          <span className="font-medium lg:mt-0 mt-4">Join via code</span>
          <form onSubmit={(event) => void handleJoinSubmit(event)}>
            <input
              type="text"
              value={validatedJoinTarget ? guestNameDraft : joinCodeDraft}
              maxLength={validatedJoinTarget ? MAX_NAME_LENGTH : 16}
              placeholder={
                validatedJoinTarget ? "Enter your name" : "project code"
              }
              className="rounded-md bg-(--dim) px-2 py-1.5 outline-none"
              onChange={(event) => {
                if (validatedJoinTarget) {
                  setGuestNameDraft(event.target.value);
                  return;
                }

                setJoinCodeDraft(event.target.value);
              }}
            />
            <button
              type="submit"
              disabled={isVerifyingCode || isJoining || isCompletingUpgrade}
              className="ml-2 rounded-md bg-(--vibrant) px-2 py-1 hover:bg-(--vibrant-hover) disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isVerifyingCode
                ? "Checking..."
                : isJoining
                  ? "Joining..."
                  : validatedJoinTarget || isSignedInRealUser
                    ? "Join"
                    : "Next"}
            </button>
          </form>
        </div>
        {validatedJoinTarget ? (
          <p className="text-(--gray-page)">
            Joining &apos;{validatedJoinTarget.projectName}&apos; as a temporary
            client.
          </p>
        ) : null}
        {isCompletingUpgrade ? (
          <p className="text-(--gray-page)">
            Linking your guest project to this account...
          </p>
        ) : null}
        {joinError ? (
          <p className="text-(--declined-border)">{joinError}</p>
        ) : null}
        {upgradeError ? (
          <p className="text-(--declined-border)">{upgradeError}</p>
        ) : null}

        <span className="inline text-wrap">
          <Link
            href="/tutorial"
            className="text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover) cursor-pointer"
          >
            Tutorial
          </Link>
          <Link
            href="/legal"
            className="ml-2 text-(--vibrant) underline underline-offset-4 hover:text-(--vibrant-hover) cursor-pointer"
          >
            Legal
          </Link>
        </span>

        <div className="w-full flex flex-col items-start justify-start overflow-hidden rounded-md border border-(--gray)">
          <div className="w-full flex items-center justify-start p-2 bg-(--darkest) text-(--gray-page) border-b border-(--gray)">
            Projects
          </div>
          {projects === undefined ? (
            <div className="w-full p-4 text-(--gray-page)">
              Loading projects...
            </div>
          ) : projects.length > 0 ? (
            <div className="w-full flex flex-col">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  className="w-full p-3 border-b last:border-b-0 border-(--gray) flex flex-col gap-1"
                  href={
                    project.pages[0]
                      ? getProjectPagePath(project.id, project.pages[0].id)
                      : getProjectPath(project.id)
                  }
                >
                  <p className="font-medium hover:text-(--vibrant)">
                    {project.name}
                  </p>
                  {project.description ? (
                    <p className="text-(--gray-page)">{project.description}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="w-full p-4 text-(--gray-page)">
              No projects yet. Create one to start working.
            </div>
          )}
        </div>
      </div>
    </SearchBarProvider>
  );
}
