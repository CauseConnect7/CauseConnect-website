import React from "react";
import campaign1 from "../images/campaign1.jpg";
import campaign2 from "../images/campaign2.jpg";
import campaign3 from "../images/campaign3.jpg";
import campaign4 from "../images/campaign4.jpg";
import campaign5 from "../images/campaign5.jpg";
import campaign6 from "../images/campaign6.jpg";
import campaign7 from "../images/campaign7.jpg";
import campaign8 from "../images/campaign8.jpg";
import campaign9 from "../images/campaign9.jpg";
import campaign10 from "../images/campaign10.jpg";

const Campaigns = () => {
  return (
    <>
      <section className="campaigns-section">
        <div className="campaigns-header">
          <div className="header-content">
            <h1>We're Linking Causes with Special Campaigns</h1>
            <p>
              Collaborate on impactful campaigns that align with your mission,
              amplify your brand, and create meaningful social change.
            </p>
          </div>
        </div>

        <div className="campaigns">
          <h2>Most Popular Campaigns</h2>
          <div className="campaign-grid">
            <div className="campaign-main">
              <div className="campaign-card">
                <img src={campaign1} alt="1% for the Planet" />
                <div className="campaign-card-content">
                  <h3>Join 1% of the Planet</h3>
                </div>
              </div>
            </div>

            <div className="campaign-secondary">
              <div className="campaign-card">
                <img src={campaign2} alt="Hope in Every Hand" />
                <div className="campaign-card-content">
                  <h3>Hope in Every Hand:</h3>
                  <p>Feeding the Hungry</p>
                </div>
              </div>

              <div className="campaign-card">
                <img src={campaign3} alt="Building Bridges" />
                <div className="campaign-card-content">
                  <h3>Building Bridges:</h3>
                  <p>Community Volunteerism</p>
                </div>
              </div>

              <div className="campaign-card">
                <img src={campaign4} alt="Winds of Change" />
                <div className="campaign-card-content">
                  <h3>Winds of Change:</h3>
                  <p>Promoting Renewable Energy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ongoing-campaigns">
        <div className="container">
          <div className="campaigns-header">
            <h2>Ongoing Campaigns</h2>
            <div className="search-box">
              <span className="material-icons">search</span>
              <input type="text" />
            </div>
          </div>

          <div className="campaigns-grid">
            <div className="campaign-card">
              <img src={campaign5} alt="Community Care" />
              <h3>Community Care</h3>
              <p>
                Empower communities by volunteering in local initiatives that
                drive social impact and create opportunities for all
              </p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign6} alt="LGBTQ+ Pride and Inclusion" />
              <h3>LGBTQ+ Pride and Inclusion</h3>
              <p>Support campaigns that celebrate diversity and inclusivity</p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign7} alt="Protecting Our Planet" />
              <h3>Protecting Our Planet</h3>
              <p>
                Engage in reforestation and environmental preservation efforts.
              </p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign8} alt="Women in Tech" />
              <h3>Women in Tech</h3>
              <p>
                Support women-led campaigns that advocate for equal rights and
                opportunities worldwide.
              </p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign9} alt="Supporting Local Farmers" />
              <h3>Supporting Local Farmers</h3>
              <p>
                Empower communities by backing sustainable agriculture and
                providing resources for local farmers to thrive.
              </p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign10} alt="Coastal Cleanup" />
              <h3>Coastal Cleanup</h3>
              <p>
                Preserve marine ecosystems by participating in initiatives to
                clean up beaches and reduce ocean pollution.
              </p>
              <button className="learn-more">Learn more</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Campaigns;
