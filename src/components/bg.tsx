import Image from "next/image";
import background from "images/background.png";

function BackgroundImage() {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      <Image src={background} alt="Background image description" />
    </div>
  );
}

export default BackgroundImage;
