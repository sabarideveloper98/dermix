import mukesh from "../assets/images/team/mukesh.png";
import harish from "../assets/images/team/harish.png";
import founder3 from "../assets/images/team/harish.png";
import gokul from "../assets/images/team/gokul.png";
import antony from "../assets/images/team/antony.png";

const founders = [
  {
    name: "Mugesh R.",
    role: "CEO & Director | Co-Founder",
    degree: "B.Pharm., Pharm.D PB",
    image: mukesh,
    quote: [
      "As a Pharm.D professional, I was trained to look beyond a molecule. Better outcomes come from choosing the right therapy, at the right dose, for the right purpose.",
      "That mindset changed how I viewed skincare. I saw many products built around trending ingredients rather than thoughtful formulation.",
      "That's how DermFix was born.",
      "We believe effective skincare begins with the right molecules, in clinically relevant concentrations, brought together through precision formulation to support the skin before damage becomes visible.",
      "That is the philosophy behind DermFix."
    ]
  },

  {
    name: "HARISH S.",
    role: "Chief Operating Officer | Co-Founder",
    degree: "B.Pharm.",
    image: harish,
    quote: [
      "Behind every DermFix product is a promise I make personally.",
      "I believe no formulation should reach your hands unless I would confidently recommend it to my own family.",
      "That belief influences every decision we make—from choosing ingredients to the final product you receive.",
      "Because your trust is our greatest responsibility."
    ]
  },

  {
    name: "GOKULBHARATHI D.",
    role: "Chief Growth Officer & Director | Co-Founder",
    degree: "B.Pharm",
    image: gokul,
    quote: ["Making Premium Skincare Accessible",
      "I believe everyone deserves access to premium skincare—not just a select few. Effective, science-backed formulations shouldn't come with unnecessary complexity or an unattainable price.",
      "At DermFix, our mission is to make clinically formulated skincare more accessible by delivering premium-quality products that are thoughtfully developed, transparently formulated, and fairly priced.",
      "Because great skincare should be a daily essential, not a luxury reserved for a few."
    ]
  },

  {
    name: "E. ANTONY REENA",
    role: "Chief Relationship Officer & Director | Co-Founder",
    degree: "",
    image: antony,
    quote: ["Behind every DermFix order is a person with a story, a concern, and the hope of healthier skin. I never want our customers to feel like just another number.",
      "My promise is simple: to build a brand that listens, cares, and stands beside you throughout your skincare journey.",
      "Because meaningful relationships are built on trust, and trust is the foundation of DermFix."
    ]
  },

  {
    name: "GOKULBHARATHI D.",
    role: "Research Director | Co-Founder",
    degree: "M.Pharm",
    image: founder3,
    quote: ["Your content here..."]
  }
];

export default function Team() {
  return (
    <>
      <section className="team_header">
        <div className="container text-center">
          <span>OUR LEADERSHIP</span>
          <h2>Meet Our Co-Founders</h2>
          <p>
            Five minds. One vision. United by science and innovation to
            build skincare that truly makes a difference.
          </p>
        </div>
      </section>

      {founders.map((item, index) => (
        <section className="team_sec" key={index}>
          <div className="container">

            <div
              className={`row align-items-center ${
                index % 2 === 1 ? "flex-row-reverse" : ""
              }`}
            >

              <div className="col-lg-5 text-center">

                <div className="team_img">

                  <div className="purple_circle"></div>

                  <img src={item.image} alt={item.name} />

                </div>

              </div>

              <div className="col-lg-7">

                <div className="team_content">

                  <span className="quote_mark">“</span>

                  <h2>{item.name}</h2>

                  <h5>{item.role}</h5>

                  <h6>{item.degree}</h6>

                  <div className="purple_line"></div>

                  {item.quote.map((text, i) => (
                    <p key={i}>{text}</p>
                  ))}

                  <h3 className="signature">{item.name}</h3>

                </div>

              </div>

            </div>

          </div>
        </section>
      ))}
    </>
  );
}