import React, { useState, useEffect } from "react";
import axios from "axios";

import { Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react/swiper-react";

const Activities = () => {
  const [sliderData, setSliderData] = useState([]);

  const getHeroSliderData = async () => {
    try {
      const response = await axios.get(
        "https://bestincoin.zeezsoft.com/api/activities"
      );

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
    <div className="activities-section">
      <div className="wrap container">
        <h1 className="sec-title">Activities</h1>
        <div className="slider-block">
          <Swiper
            slidesPerView={3.3}
            spaceBetween={18}
            pagination={{
              clickable: true,
            }}
            modules={[Pagination]}
            autoplay={{ delay: 3000 }} // Add autoplay option
            breakpoints={{
              // For Desktop
              1024: {
                slidesPerView: 3.3,
                autoplay: false,
              },
              // For tablets
              768: {
                slidesPerView: 2,
                autoplay: false,
              },
              // For mobile screens
              320: {
                slidesPerView: 1,
                autoplay: false,
              },
            }}
            className="mySwiper"
          >
            {sliderData?.map((item, index) => (
              <SwiperSlide key={index}>
                <img
                  src={`https://bestincoin.zeezsoft.com/${item.image}`}
                  className="slider-img"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Activities;
