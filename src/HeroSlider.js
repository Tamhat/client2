import React, { useState, useEffect } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import axios from "axios";

const HeroSlider = () => {
  const [sliderData, setSliderData] = useState([]);

  const getHeroSliderData = async () => {
    try {
      const response = await axios.get(
        "https://bestincoin.zeezsoft.com/api/sliders"
      );

      console.log("heros slider.../", response.data?.data);
      if (response.status === 200) {
        setSliderData(response.data?.data);
      }
    } catch (error) {
      // Handle errors here
      console.error(error);
    }
  };

  useEffect(() => {
    getHeroSliderData();
  }, []);
  return (
    <div className="hero-slider">
      <Carousel autoPlay={true} infiniteLoop={true} showThumbs={false}>
        {sliderData.length ? (
          sliderData.map((item, index) => (
            <div>
              <img
                // src={`./images/sliderImges/slider1.png`}
                src={`https://bestincoin.zeezsoft.com/${item?.image}`}
                className="slider-img"
                alt={item.title}
                // onError={(e) => {
                //   e.target.src = "./images/sliderImges/slider1.png";
                // }}
              />
            </div>
          ))
        ) : (
          <div>
            <img
              src="./images/sliderImges/slider1.png"
              className="slider-img"
            />
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default HeroSlider;
