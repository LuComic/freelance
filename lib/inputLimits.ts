export const MAX_SHORT_TITLE_LENGTH = 120;
export const MAX_NAME_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_BIO_LENGTH = 300;
export const MAX_SEARCH_QUERY_LENGTH = 100;
export const MAX_IDEA_LENGTH = 400;
export const MAX_TAG_LENGTH = 40;
export const MAX_OPTIONS_PER_FIELD = 30;
export const MAX_OPTION_LABEL_LENGTH = 80;
export const MAX_FORM_FIELDS = 30;
export const MAX_FORM_TEXT_ANSWER_LENGTH = 1000;
export const MAX_CALENDAR_EVENT_TITLE_LENGTH = 120;
export const MAX_KANBAN_TASK_LENGTH = 200;

export function truncateInput(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
