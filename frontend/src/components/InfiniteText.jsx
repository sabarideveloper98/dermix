import * as MarqueeModule from "react-fast-marquee";

const Marquee = MarqueeModule.default.default;

export default function InfiniteText() {
    return (
        <Marquee speed={60}>
            <div className="infiniteSlide infiniteSlide-wrapper" data-clone="3">
                <div className="infiniteSlide-item">
                    <p className="text h1 font-instrument_serif">
                        Pure Ingredients Only
                    </p>
                </div>
                <div className="infiniteSlide-item">
                    <div className="br-dot stroke"></div>
                </div>
                <div className="infiniteSlide-item">
                    <p className="text h1 font-instrument_serif troke-text_black">
                        Effortless Radiance
                    </p>
                </div>
                <div className="infiniteSlide-item">
                    <div className="br-dot stroke"></div>
                </div>
                <div className="infiniteSlide-item">
                    <p className="text h1 font-instrument_serif">
                        Your Skin, Elevated
                    </p>
                </div>
                <div className="infiniteSlide-item">
                    <div className="br-dot stroke"></div>
                </div>
                <div className="infiniteSlide-item">
                    <p className="text h1 font-instrument_serif troke-text_black">
                        Less But Better
                    </p>
                </div>
            </div>
        </Marquee>
    );
}