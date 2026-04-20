import Header from "@/components/header/Header";
import BannerIntro from "@/components/home/BannerIntro";
import WhyFPT from "@/components/home/WhyFPT";
import Programs from "../../components/home/Programs";
import Admissions from "../../components/home/Admissions";
import Contact from "@/components/home/Contact";
import Footer from "@/components/footer/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
function Home() {
    const location = useLocation();
     useEffect(() => {
    if (location.hash === "#admissions") {
      // đợi DOM render xong rồi mới cuộn
      setTimeout(() => {
        document.getElementById("admissions")?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <BannerIntro />
      <WhyFPT />
      <Programs />
      <Admissions />
      <Contact />
      <Footer />
    </div>
  );
}


export default Home;