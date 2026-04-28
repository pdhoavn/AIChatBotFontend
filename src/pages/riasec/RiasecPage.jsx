import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import RiasecGuestForm from '../../components/riasec/RiasecGuestForm.jsx';

const RiasecPage =() =>{
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return(
    <>
    <Header minimal />
    <div class='pb-8'></div>
    <RiasecGuestForm/>
    <Footer />

    {showScrollTop && (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#facb01] text-white shadow-lg hover:bg-[#d14f0a] transition-all"
            aria-label="Scroll to top"
        >
            <ChevronUp className="h-5 w-5" />
        </button>
    )}
    </>
    )

}
export default RiasecPage;