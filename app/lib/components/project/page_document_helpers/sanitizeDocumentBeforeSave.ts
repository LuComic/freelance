import type { PageDocumentV1 } from "@/lib/pageDocument";

export function sanitizeDocumentBeforeCreatorSave(
  document: PageDocumentV1,
  activeClientUserIds: Set<string>,
): PageDocumentV1 {
  if (activeClientUserIds.size === 0) {
    return document;
  }

  let hasChanges = false;
  const nextComponents = Object.fromEntries(
    Object.entries(document.components).map(([instanceId, component]) => {
      if (component.type !== "IdeaBoard") {
        return [instanceId, component];
      }

      const nextIdeas = component.state.ideas
        .filter(
          (idea) =>
            component.config.canClientAdd ||
            idea.createdByUserId === null ||
            !activeClientUserIds.has(idea.createdByUserId),
        )
        .map((idea) => ({
          ...idea,
          votes: component.config.canClientVote
            ? idea.votes
            : idea.votes.filter((userId) => !activeClientUserIds.has(userId)),
        }));

      const componentChanged =
        nextIdeas.length !== component.state.ideas.length ||
        nextIdeas.some((idea, index) => {
          const currentIdea = component.state.ideas[index];

          if (!currentIdea) {
            return true;
          }

          return (
            idea.createdByUserId !== currentIdea.createdByUserId ||
            idea.idea !== currentIdea.idea ||
            idea.votes.length !== currentIdea.votes.length ||
            idea.votes.some((voteUserId, voteIndex) => {
              return voteUserId !== currentIdea.votes[voteIndex];
            })
          );
        });

      if (!componentChanged) {
        return [instanceId, component];
      }

      hasChanges = true;

      return [
        instanceId,
        {
          ...component,
          state: {
            ...component.state,
            ideas: nextIdeas,
          },
        },
      ];
    }),
  ) as PageDocumentV1["components"];

  if (!hasChanges) {
    return document;
  }

  return {
    ...document,
    components: nextComponents,
  };
}
