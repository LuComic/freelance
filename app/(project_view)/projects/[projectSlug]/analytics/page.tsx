import { InputDropdown } from "@/app/lib/components/analytics/InputDropdown";

export type DropdownItem = {
  page: string;
  components: { title: string; value: string[] }[];
};

type LatestChange = {
  page: string;
  title: string;
  oldValue: string | null;
  newValue: string;
};

const LATEST_CHANGES: LatestChange[] = [
  {
    page: "Preferences",
    title: "Favourite colors",
    oldValue: "Blue",
    newValue: "Green",
  },
  {
    page: "Preferences",
    title: "Preferred fonts",
    oldValue: "Roboto",
    newValue: "Poppins",
  },
  {
    page: "Suggestions",
    title: "Suggest your ideas",
    oldValue: null,
    newValue: "Create an About page as well",
  },
];

const CURRENT_INPUTS: DropdownItem[] = [
  {
    page: "Preferences",
    components: [
      {
        title: "Favourite colors",
        value: ["Red", "Blue", "Green"],
      },
      {
        title: "Preferred fonts",
        value: ["Poppins", "Roboto"],
      },
    ],
  },
  {
    page: "Suggestions",
    components: [
      {
        title: "Suggest your ideas",
        value: [
          "Create an About page as well",
          "Turn the color picker into a slider",
        ],
      },
    ],
  },
];

export default function AnalyticsPage() {
  return (
    <>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-3xl text-xl font-medium">Analytics</p>
      </div>
      <p className="text-(--gray-page)">
        Here you can see the most recent changes the client has made and what
        options they have selected. All of these come from Input components.
      </p>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-xl text-lg font-medium">Latest changes</p>
      </div>
      <div className="flex flex-col items-start justify-start w-full">
        {LATEST_CHANGES.map((item, index) => (
          <div
            key={index}
            className={`${index % 2 !== 0 && "bg-(--gray)/10"} w-full p-2 flex flex-col gap-2`}
          >
            <div className="flex items-center justify-start gap-2 text-(--gray-page)">
              <p className="font-medium @[40rem]:text-lg text-base text-(--light)">
                {item.page}
              </p>
              <p>/</p>
              <p>{item.title}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-full rounded-md border border-(--declined-border) bg-(--declined-bg)/10 px-2 py-1">
                <span className="text-(--declined-border) mr-2">-</span>
                {item.oldValue ?? "No previous value"}
              </div>
              <div className="w-full rounded-md border border-(--accepted-border) bg-(--accepted-bg)/10 px-2 py-1">
                <span className="text-(--accepted-border) mr-2">+</span>
                {item.newValue}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full border-b border-(--gray) pb-2 flex flex-col gap-2">
        <p className="@[40rem]:text-xl text-lg font-medium">Inputs</p>
      </div>
      <div className="flex flex-col items-start justify-start w-full">
        {CURRENT_INPUTS.map((item, index) => (
          <InputDropdown key={index} item={item} index={index} />
        ))}
      </div>
    </>
  );
}
