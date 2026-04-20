import React from 'react';
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import RiasecGuestForm from '../../components/riasec/RiasecGuestForm.jsx';

const RiasecPage =() =>{
    return(
    <>
    <Header />
    <div class='pb-8'></div>
    <RiasecGuestForm/>
    <Footer />
    </>
    )

}
export default RiasecPage;