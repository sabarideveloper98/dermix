const ingredients = [
    {
      name: "Niacinamide",
      image: "ingredient-1.jpg",
      desc: "A multitasking active known to refine pores, balance oil production, and visibly improve skin clarity — without disrupting the barrier.",
    },
    {
      name: "Peptides",
      image: "ingredient-2.jpg",
      desc: "Support skin resilience and elasticity with targeted peptide complexes designed to promote smoother, firmer-looking skin over time.",
    },
    {
      name: "Ceramides",
      image: "ingredient-3.jpg",
      desc: "Essential lipids that help reinforce the skin barrier, lock in moisture, and protect against environmental stress.",
    },
    {
      name: "Botanical Extracts",
      image: "ingredient-4.jpg",
      desc: "Carefully selected plant-derived ingredients that soothe, calm, and complement our active formulations.",
    },
  ];
  
  export default function Ingredients() {
    return (
      <div className="section-split section-ingredient-2">
        <div className="col-content bg-main_100 justify-content-start">
          <div className="sect-heading-v2 start sticky-top m-0 wow fadeInUp">
            <p className="eyebrow-label">
              <span className="br-dot"></span>
              OUR INGREDIENTS
            </p>
            <h4 className="s-title font-instrument_serif lh-xxl-48">
              "We select ingredients for their integrity and balance — combining proven actives with gentle,
              skin-supportive elements. Each formula is composed to strengthen, restore, and quietly enhance
              your natural glow."
            </h4>
          </div>
        </div>
  
        <div className="col-media">
          {ingredients.map((ingredient) => (
            <div className="wg-ingredient" key={ingredient.name}>
              <h5 className="ing-title font-instrument_serif text-white lh-xl-40 wow fadeInUp">
                {ingredient.name}
              </h5>
              <div className="ing-image">
                <img
                  className="wow fadeZoomOut"
                  loading="lazy"
                  width="280"
                  height="280"
                  src={`/assets/images/section/${ingredient.image}`}
                  alt={ingredient.name}
                />
              </div>
              <p className="ing-desc text-white wow fadeInUp">{ingredient.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  