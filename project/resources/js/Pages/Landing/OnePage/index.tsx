import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';

import Client from './client';
import Contact from './contact';
import Counter from './counter';
import Cta from './cta';
import Faqs from './faq';
import Features from './features';
import Footer from './footer';
import Home from './home';
import Navbar from './navbar';
import Plans from './plans';
import Reviews from './reviews';
import Services from './services';
import Team from './team';
import WorkProcess from './workProcess';

const Index = () => {
    const scrollFunction = () => {
        const element = document.getElementById("back-to-top");
        if (element) {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                element.style.display = "block";
            } else {
                element.style.display = "none";
            }
        }
    };

    useEffect(() => {
        const onScroll = () => scrollFunction();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };
    return (
        <React.Fragment>
            <Head title='appsah SaaS Boilerplate'>
                <meta name="description" content="appsah adalah boilerplate SaaS multi-tenant berbasis Laravel, Inertia, dan React." />
                <meta property="og:title" content="appsah SaaS Boilerplate" />
                <meta property="og:description" content="Fondasi SaaS core dengan tenant isolation, OCC, API envelope, dan audit log." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.origin} />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: 'appsah SaaS Boilerplate',
                        url: window.location.origin,
                    })}
                </script>
            </Head>
            <div className="layout-wrapper landing">
                <Navbar />
                <Home />
                <Client />
                <Services />
                <Features />
                <Plans />
                <Faqs />
                <Reviews />
                <Counter />
                <WorkProcess />
                <Team />
                <Contact />
                <Cta />
                <Footer />
                <button onClick={() => toTop()} className="btn btn-danger btn-icon landing-back-top" id="back-to-top">
                    <i className="ri-arrow-up-line"></i>
                </button>
            </div>
        </React.Fragment>
    );
};
// Index.layout = (page:any) => <Layout children={page}/>
export default Index;
