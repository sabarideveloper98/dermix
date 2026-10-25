import MarqueeModule from "react-fast-marquee";

const Marquee =
  typeof MarqueeModule === "function"
    ? MarqueeModule
    : MarqueeModule.default;
// import "./InfiniteText.css";

const marqueeItems = [
  { text: "Pure Ingredients Only", outline: false },
  { dot: true },
  { text: "Effortless Radiance", outline: true },
  { dot: true },
  { text: "Your Skin, Elevated", outline: false },
  { dot: true },
  { text: "Less But Better", outline: true },
  { dot: true },
];

export default function InfiniteText() {
  return (
    <div className="infinite-marquee my-5">
      <Marquee
        speed={60}
        direction="left"
        loop={0}
        autoFill={true}
        pauseOnHover={false}
        gradient={false}
      >
        <div className="infiniteSlide">
          {marqueeItems.map((item, index) => (
            <div className="infiniteSlide-item" key={index}>
              {item.dot ? (
                <span className="br-dot" aria-hidden="true" />
              ) : (
                <p
                  className={`marquee-text font-instrument_serif ${
                    item.outline ? "stroke-text_black" : ""
                  }`}
                >
                  {item.text}
                </p>
              )}
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}