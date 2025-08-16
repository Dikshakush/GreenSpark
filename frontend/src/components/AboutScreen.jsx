import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./AboutScreen.css";

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1200 });
  }, []);

  return (
    <>
      {/* Main content wrapper */}
      <div className="about-wrapper">
        {/* Section 1 */}
        <section className="about-section blue-background">
          <h2 data-aos="fade-up" className="text-center mb-4">
            Our Commitment to the Planet 🌍
          </h2>
          <div className="container">
            <div className="about-box" data-aos="zoom-in">
              <h5>Sustainability</h5>
              <p>
                We encourage conscious choices that reduce carbon footprint and
                support a greener planet.
              </p>
            </div>
            <div className="about-box" data-aos="zoom-in">
              <h5>Eco Actions</h5>
              <p>
                Track and log your green activities – from cycling to recycling,
                every step counts.
              </p>
            </div>
            <div className="about-box" data-aos="zoom-in">
              <h5>Recognition</h5>
              <p>
                Earn points and badges as you take part in climate-positive
                actions in your community.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="about-section white-background">
          <h2 data-aos="fade-up" className="text-center mb-4">
            Why GreenSpark Stands Out 🌱
          </h2>
          <div className="container">
            <div className="about-box" data-aos="fade-right">
              <h5>Track Your Impact</h5>
              <p>
                Monitor your eco-efforts with points, CO₂ stats, and meaningful
                data.
              </p>
            </div>
            <div className="about-box" data-aos="fade-up">
              <h5>Earn Eco-Badges</h5>
              <p>
                Get recognized with badges and achievements as you grow on your
                eco-journey.
              </p>
            </div>
            <div className="about-box" data-aos="fade-left">
              <h5>Visual Insights</h5>
              <p>
                View progress charts and discover how your actions help the
                environment.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="about-section white-background">
          <h2 data-aos="fade-up" className="text-center mb-3">
            About GreenSpark
          </h2>
          <p 
            className="about-description"
            data-aos="fade-up"
            data-aos-offset="200"
            data-aos-duration="800"
          >
            GreenSpark is a gamified eco-tracking platform designed to inspire
            individuals and communities to take measurable actions toward a
            sustainable future. By logging eco-friendly behaviors like cycling,
            recycling, and reducing electricity use, users earn points, track
            CO₂ saved, and unlock badges. It transforms climate responsibility
            into a rewarding experience, turning small steps into impactful
            change.
          </p>
        </section>
      </div>

      {/* Footer moved OUTSIDE main flex wrapper */}
      <footer className="footer-bar">
        <p>Developed by Team @GreenSpark</p>
      </footer>
    </>
  );
};

export default About;