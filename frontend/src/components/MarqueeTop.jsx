import MarqueeModule from "react-fast-marquee";

const Marquee = MarqueeModule.default;

function MarqueeTop() {
  return (
    <div className="marquee_sec">
      <Marquee speed={50} gradient={false}>
        <span style={{ marginRight: 80 }}>
        ✦ The Right Molecules. The Right Dose. Before Damage Begins ✦
        </span>
        <span style={{ marginRight: 80 }}>
        ✦ Crafted By Clinical Mind ✦
        </span>
        <span style={{ marginRight: 80 }}>
        ✦ Prevention Over Trends ✦
        </span>
        <span style={{ marginRight: 80 }}>
        ✦ The Right Molecules. The Right Dose. Before Damage Begins ✦
        </span>
        <span style={{ marginRight: 80 }}>
        ✦ Crafted By Clinical Mind ✦
        </span>
        <span style={{ marginRight: 80 }}>
        ✦ Prevention Over Trends ✦
        </span>
      </Marquee>
    </div>
  );
}

export default MarqueeTop;