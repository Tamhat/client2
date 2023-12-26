import React from "react";
import Webcam from "react-webcam";

export default class WebcamCapture extends React.Component {
  state = {
    imageSrc: null,
    fileImgUrl:null
  };

  setRef = webcam => {
    this.webcam = webcam;
  };

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    const fileImgUrl=this.dataURLtoFile(imageSrc,'capturedfile.jpeg')
    this.setState({ imageSrc,fileImgUrl});
    this.props.onCapture({ imageSrc,fileImgUrl})
  };

   dataURLtoFile=(dataurl, filename)=> {
 
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
}

  render() {
    const { imageSrc,fileImgUrl } = this.state;
    //console.log(imageSrc,fileImgUrl)
    const videoConstraints = {
      width: 720,
      height: 720,
      facingMode: "user"
    };

    console.log('this.webcam',this.webcam)
    return (
      <div>
        <Webcam
          audio={false}
          height={350}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          width={350}
          videoConstraints={videoConstraints}
        />
        <button onClick={this.capture}>Capture photo</button>
        {imageSrc && <img src={imageSrc} />}
      </div>
    );
  }
}
