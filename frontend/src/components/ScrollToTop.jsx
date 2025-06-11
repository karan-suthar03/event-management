import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

function ScrollToTop() {
    const {pathname, hash} = useLocation();

    useEffect(() => {
        // Handle hash navigation (for anchor links)
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({behavior: 'smooth'});
                return;
            }
        }

        // Scroll to top for regular navigation
        const scrollToTop = () => {
            window.scrollTo(0, 0);
            // Also scroll any potential scrollable containers
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        // Execute after the component has rendered
        const timeoutId = setTimeout(scrollToTop, 0);

        return () => clearTimeout(timeoutId);
    }, [pathname, hash]);

    return null;
}

export default ScrollToTop;
