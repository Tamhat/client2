import React, { useState } from "react";

import { Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react/swiper-react";

const VotingResultSlider = () => {
  const [sliderData, setSliderData] = useState([
    { img: "./images/sliderImges/v1.png", url: "/" },
    { img: "./images/sliderImges/v2.png", url: "/" },
    { img: "./images/sliderImges/v3.png", url: "/" },
    { img: "./images/sliderImges/v4.png", url: "/" },
    { img: "./images/sliderImges/v5.png", url: "/" },
  ]);

  return (
    <div className="activities-section">
      <div className="wrap container">
        {/* <h1 className="sec-title">Announcement of Adjusting Token</h1> */}
        <div className="slider-block">
          <Swiper
            slidesPerView={4}
            spaceBetween={18}
            pagination={{
              clickable: true,
            }}
            modules={[Pagination]}
            autoplay={{ delay: 3000 }} // Add autoplay option
            breakpoints={{
              // For Desktop
              1024: {
                slidesPerView: 3,
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
                <img src={`${item.img}`} className="slider-img" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="link-lbl">
          Invite friends and enjoy 40% in trading commissions
        </div>
      </div>
    </div>
  );
};

export default VotingResultSlider;
