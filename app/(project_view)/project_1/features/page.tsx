import { cookies } from "next/headers";
import {
  FEEDBACK_CLIENT_LAYOUT_COOKIE,
  FEEDBACK_CREATOR_LAYOUT_COOKIE,
} from "@/app/lib/cookies";
import { FeatureSelector } from "@/app/lib/components/FeatureSelector";

export default async function Page() {
  const cookieStore = await cookies();
  const clientLayoutValue = cookieStore.get(
    FEEDBACK_CLIENT_LAYOUT_COOKIE,
  )?.value;
  const creatorLayoutValue = cookieStore.get(
    FEEDBACK_CREATOR_LAYOUT_COOKIE,
  )?.value;

  const initialClientLayout =
    clientLayoutValue === "grid" || clientLayoutValue === "list"
      ? clientLayoutValue
      : undefined;
  const initialCreatorLayout =
    creatorLayoutValue === "grid" || creatorLayoutValue === "list"
      ? creatorLayoutValue
      : undefined;

  return (
    <>
      <h1 className="md:text-3xl text-xl font-medium">
        This is the feature showcase page
      </h1>
      <FeatureSelector
        initialClientLayout={initialClientLayout}
        initialCreatorLayout={initialCreatorLayout}
      />
    </>
  );
}
