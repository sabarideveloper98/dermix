import philo_doctor from "../assets/images/team/doctor_philo.png";
import bg_philosophy from "../assets/images/bg/bg22.jpg";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Philosophy() {
    return (
      <div className="section-philosophy">
        <div className="container">
              <div className="row">
                  <div className="col-md-6">
                        <div className="philosophy_head">
                             <h5>our philosophy</h5>
                             <h4>Prevention Begins <br /> <span className="philo_span">with beter formulation.</span></h4>
                        </div>
                        <p className="philo_p">At DermFix, we believe effective skincare is never about following trends or simply adding more ingredients.
                            It is about choosing the <span className="laven_high">right molecules,</span> at the <span className="laven_high">right concentration,</span> in the <span className="laven_high">right formulation,</span> to deliver meaningful results skin recovery.
                        </p>
                        <ul className="philo_ul">
                          <li><i className="fa-solid fa-circle-check philo_i"></i> <span className="laven_high"> Precision </span> is our philosophy.</li>
                          <li><i className="fa-solid fa-circle-check philo_i"></i> <span className="laven_high"> Prevention </span> is our purpose.</li>
                        </ul>

                        <h6 className="philo_h6">That's the <span className="laven_high"> DermFix </span> Promise.</h6>
                  </div>
                  <div className="col-md-6">
                       <div className="philo_img">
                           <img className="scale-item scale-item-1" loading="lazy"  src={philo_doctor} alt="Slider" />
                       </div>
                  </div>
              </div>
          {/* <div className="br-line bg-line-5"></div> */}
        </div>
      </div>
    );
  }
  