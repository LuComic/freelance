export const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-(--gray)">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <svg
          viewBox="0 0 900 600"
          className="absolute -bottom-32 right-0 h-120 w-120 blur-3xl opacity-30"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <g transform="translate(420.69996617713275 327.69466148331287) scale(0.82 1.35)">
            <path
              d="M88.4 -150.2C122.3 -115.7 163.1 -104.4 190.9 -77.3C218.7 -50.1 233.5 -7.2 232.3 36.7C231.1 80.6 213.8 125.4 183.8 158.2C153.7 190.9 111 211.6 70.8 208.4C30.6 205.3 -6.9 178.5 -49 166.4C-91.1 154.3 -137.8 157.1 -158.7 135.9C-179.7 114.7 -175 69.6 -167 32.6C-159 -4.5 -147.7 -33.4 -143.6 -75.2C-139.4 -117 -142.4 -171.6 -119.7 -211.3C-97 -250.9 -48.5 -275.4 -10.6 -258.9C27.2 -242.3 54.4 -184.7 88.4 -150.2"
              fill="#0061ff"
            />
          </g>
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:justify-between md:px-8">
        <div>
          <p className="text-(--gray-page)">Built by</p>
          <p className="text-lg font-medium">Lukas Jääger</p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 md:mx-auto">
          <a
            href="https://jaager.dev/"
            className="underline underline-offset-4"
            target="_blank"
          >
            Portfolio
          </a>
          <span className="hidden sm:inline">-</span>
          <a
            href="https://x.com/LuComic3"
            className="underline underline-offset-4"
            target="_blank"
          >
            X
          </a>
          <span className="hidden sm:inline">-</span>
          <a
            href="https://www.instagram.com/ai.nurakk/"
            className="underline underline-offset-4"
            target="_blank"
          >
            Instagram
          </a>
          <span className="hidden sm:inline">-</span>
          <a
            href="https://www.linkedin.com/in/lukas-jääger-6a0747307/"
            className="underline underline-offset-4"
            target="_blank"
          >
            Linkedin
          </a>
          <span className="hidden sm:inline">-</span>
          <a
            href="https://ko-fi.com/ainurakk"
            className="underline underline-offset-4"
            target="_blank"
          >
            Support
          </a>
        </div>

        <div className="md:text-right">
          <p className="text-(--gray-page)">Project repo</p>
          <a
            className="text-lg font-medium underline underline-offset-4"
            target="_blank"
            href="https://github.com/LuComic/freelance"
          >
            freelance-app
          </a>
        </div>
      </div>
    </footer>
  );
};
