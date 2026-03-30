import { Link } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Collapse, Container, NavbarToggle } from 'react-bootstrap';

// Import Images
import logodark from '../../../../images/appsah-logo-dark.png';
import logolight from '../../../../images/appsah-logo-light.png';

const sectionLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'features', label: 'Features' },
    { id: 'plans', label: 'Plans' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'team', label: 'Team' },
    { id: 'contact', label: 'Contact' },
] as const;

const Navbar = () => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [activeSection, setActiveSection] = useState<(typeof sectionLinks)[number]['id']>('hero');

    const navClass = useMemo(() => (isSticky ? 'is-sticky' : ''), [isSticky]);

    useEffect(() => {
        const onScroll = () => {
            const top = document.documentElement.scrollTop || document.body.scrollTop;
            setIsSticky(top > 50);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const observers = sectionLinks
            .map(({ id }) => document.getElementById(id))
            .filter((section): section is HTMLElement => Boolean(section))
            .map((section) => {
                const observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                setActiveSection(section.id as (typeof sectionLinks)[number]['id']);
                            }
                        });
                    },
                    {
                        rootMargin: '-35% 0px -50% 0px',
                        threshold: 0.1,
                    }
                );

                observer.observe(section);

                return observer;
            });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, []);

    const handleNavClick = (sectionId: (typeof sectionLinks)[number]['id']) => {
        const target = document.getElementById(sectionId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', `#${sectionId}`);
            setActiveSection(sectionId);
            setIsOpenMenu(false);
        }
    };

    return (
        <React.Fragment>
            <nav className={`navbar navbar-expand-lg navbar-landing fixed-top ${navClass}`.trim()} id="navbar">
                <Container>
                    <Link className="navbar-brand" href="/landing">
                        <img src={logodark} className="card-logo card-logo-dark" alt="logo dark" height="17" />
                        <img src={logolight} className="card-logo card-logo-light" alt="logo light" height="17" />
                    </Link>

                    <NavbarToggle
                        className="navbar-toggler py-0 fs-20 text-body"
                        onClick={() => setIsOpenMenu((current) => !current)}
                        type="button"
                        aria-controls="navbarSupportedContent"
                        aria-expanded={isOpenMenu}
                        aria-label="Toggle navigation"
                    >
                        <i className="ri-menu-line"></i>
                    </NavbarToggle>

                    <Collapse in={isOpenMenu} className="navbar-collapse">
                        <>
                            <ul className="navbar-nav mx-auto mt-2 mt-lg-0" id="navbar-example">
                                {sectionLinks.map((link) => (
                                    <li className="nav-item" key={link.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleNavClick(link.id)}
                                            className={`nav-link fs-15 fw-semibold border-0 bg-transparent ${activeSection === link.id ? 'active' : ''}`}
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div>
                                <Link href="/login" className="btn btn-link fw-medium text-decoration-none text-body">
                                    Sign in
                                </Link>
                                <Link href="/register" className="btn btn-primary">
                                    Sign Up
                                </Link>
                            </div>
                        </>
                    </Collapse>
                </Container>
            </nav>
        </React.Fragment>
    );
};

export default Navbar;
