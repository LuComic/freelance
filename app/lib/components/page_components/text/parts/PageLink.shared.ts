export type ProjectPageOption = {
  id: string;
  title: string;
};

export const PAGE_LINK_DEFAULT_TEXT = "link to page";

export function getPageLinkFallbackText(targetPageTitle?: string | null) {
  const trimmedTitle = targetPageTitle?.trim();
  return trimmedTitle ? trimmedTitle : PAGE_LINK_DEFAULT_TEXT;
}

export function shouldSyncPageLinkText(
  currentText: string,
  currentTargetPageTitle?: string | null,
) {
  const trimmedText = currentText.trim();
  const trimmedCurrentTargetPageTitle = currentTargetPageTitle?.trim();

  if (!trimmedText || trimmedText === PAGE_LINK_DEFAULT_TEXT) {
    return true;
  }

  return (
    Boolean(trimmedCurrentTargetPageTitle) &&
    trimmedText === trimmedCurrentTargetPageTitle
  );
}
