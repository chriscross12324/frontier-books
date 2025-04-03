import { useState } from "react";
import styles from '../css/PageCat.module.css';
import { useNavigate } from "react-router";

export default function Cat() {
  const [catImage, setCatImage] = useState("https://cataas.com/cat");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchCatImage = () => {
    setLoading(true);
    const newImage = `https://cataas.com/cat?timestamp=${new Date().getTime()}`;
    
    // Preload the image before setting the state
    const img = new Image();
    img.src = newImage;
    img.onload = () => {
      setCatImage(newImage);
      setLoading(false);
    };
  };

  return (
    <div className={styles.pageContainerHolder}>
      <div>
        {loading ? (
          <div></div>
        ) : (
          <img src={catImage} alt="Random Cat" className={styles.image} />
        )}
      </div>
      <button
        onClick={fetchCatImage}
        className={styles.buttonContinue}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get New Cat"}
      </button>
      <button className={styles.buttonContinue} onClick={() => navigate("/")}>Back</button>
    </div>
  );
}