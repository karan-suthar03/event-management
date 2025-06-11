import React, {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    HiArrowPath,
    HiCheckCircle,
    HiGift,
    HiHeart,
    HiOutlineCalendar,
    HiOutlineSparkles,
    HiStar,
    HiUserGroup
} from "react-icons/hi2";
import EventCard from "../components/EventCard";
import RequestOfferingModal from "../components/RequestOfferingModal";
import PublicOfferingCard from "../components/PublicOfferingCard";
import apiService from "../utils/apiService";

const Home = ({globalDiscount}) => {
    const [events, setEvents] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedOffering, setSelectedOffering] = useState(null);
    const navigate = useNavigate();

    const featuredEvents = useMemo(() => events.filter((ev) => ev.featured), [events]);
    const popularOfferings = useMemo(() => offerings.slice(0, 6), [offerings]);

    const processSteps = [
        {
            icon: HiOutlineCalendar,
            title: "Explore & Inspire",
            description: "Browse our stunning portfolio and find your perfect style",
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/10"
        },
        {
            icon: HiOutlineSparkles,
            title: "Plan & Personalize",
            description: "Work with our team to customize every detail",
            color: "from-pink-500 to-red-500",
            bgColor: "bg-pink-500/10"
        },
        {
            icon: HiCheckCircle,
            title: "Celebrate & Cherish",
            description: "Enjoy your perfectly executed dream event",
            color: "from-red-500 to-orange-500",
            bgColor: "bg-red-500/10"
        }
    ];

    const testimonials = [
        {
            name: "Priya Sharma",
            quote: "Eventify transformed my daughter's birthday into a magical wonderland. Every detail was perfect!",
            event: "Enchanted Princess Party",
            avatar: "https://randomuser.me/api/portraits/women/1.jpg",
            rating: 5
        },
        {
            name: "Rahul Malhotra",
            quote: "Our anniversary celebration was absolutely stunning. Ananya's creativity exceeded all expectations!",
            event: "Golden Anniversary Gala",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            rating: 5
        },
        {
            name: "Anjali Kapoor",
            quote: "From planning to execution, everything was flawless. Our guests are still talking about it!",
            event: "Garden Wedding Reception",
            avatar: "https://randomuser.me/api/portraits/women/3.jpg",
            rating: 5
        }
    ];

    const stats = [
        {number: "500+", label: "Events Completed", icon: HiOutlineCalendar},
        {number: "1000+", label: "Happy Clients", icon: HiUserGroup},
        {number: "50+", label: "Unique Themes", icon: HiOutlineSparkles},
        {number: "100%", label: "Satisfaction Rate", icon: HiHeart}
    ];
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const [eventsData, offeringsData] = await Promise.all([
                    apiService.get("/api/events"),
                    apiService.get("/api/offerings").catch(() => [])
                ]);

                setEvents(eventsData);
                setOfferings(offeringsData);
            } catch (err) {
                setError("Could not load events.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const LoadingSpinner = () => (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                <div className="animate-pulse absolute inset-0 rounded-full border-2 border-purple-300/30"></div>
            </div>
            <p className="text-purple-400 text-lg mt-4 font-medium">Creating magic...</p>
        </div>
    );

    const ErrorDisplay = ({message}) => (
        <div className="max-w-2xl mx-auto">
            <div
                className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-700 rounded-2xl p-8 text-center backdrop-blur-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                    <HiArrowPath className="w-8 h-8 text-red-400"/>
                </div>
                <p className="text-red-300 text-xl font-semibold mb-6">{message}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-3 transform hover:scale-105"
                >
                    <HiArrowPath className="w-5 h-5"/>
                    Try Again
                </button>
            </div>
        </div>
    );

    const NoDataDisplay = ({title, linkTo, linkText, icon: Icon = HiOutlineCalendar}) => (
        <div className="text-center py-16">
            <div
                className="max-w-md mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
                <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Icon className="w-10 h-10 text-purple-400"/>
                </div>
                <p className="text-xl text-gray-300 mb-6">{title}</p>
                <Link
                    to={linkTo}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 inline-block transform hover:scale-105"
                >
                    {linkText}
                </Link>
            </div>
        </div>
    );
    return (
        <div className="space-y-20 md:space-y-32 pb-20">
            <section className="relative pt-20 pb-20 md:pt-32 md:pb-24 text-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-red-600/30 opacity-50 animate-gradient-xy"></div>
                <div
                    className="absolute inset-0 opacity-10 pattern-dots pattern-gray-700 pattern-size-8 pattern-opacity-30"></div>

                <div className="relative container mx-auto px-4 z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Crafting Unforgettable
            </span>
                        <br/>
                        <span className="text-gray-100">Moments & Memories</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
                        From intimate gatherings to grand celebrations, Eventify brings your
                        vision to life with creativity, passion, and meticulous planning.
                        Let's make your next event extraordinary.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link
                            to="/events"
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
                        >
                            Explore Events
                        </Link>
                        <Link
                            to="/offerings"
                            className="px-8 py-4 border-2 border-purple-400 text-purple-300 font-semibold rounded-lg shadow-md hover:bg-purple-400 hover:text-gray-900 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                        >
                            View Decor Packages
                        </Link>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Featured
            </span>{" "}
                        Events
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Get inspired by some of our most loved and memorable event creations.
                    </p>
                </div>

                {loading ? (
                    <LoadingSpinner/>
                ) : error ? (
                    <ErrorDisplay message={error}/>
                ) : featuredEvents.length === 0 ? (
                    <NoDataDisplay
                        title="No featured events at the moment."
                        linkTo="/events"
                        linkText="View All Events"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {featuredEvents.slice(0, 3).map((event) => (
                            <EventCard key={event.id} event={event} modern={true}/>
                        ))}
                    </div>
                )}
            </section>
            <section className="container mx-auto px-4 py-16 rounded-xl shadow-xl backdrop-blur-md">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-3">
                        Your Dream Event in{" "}
                        <span
                            className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500">
              3 Simple Steps
            </span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Bringing your perfect celebration to life is easier than you think.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center">
                    {[
                        {
                            icon: HiOutlineCalendar,
                            title: "1. Explore & Inspire",
                            description: "Browse our portfolio of stunning events and decor packages. Find what sparks your joy or share your unique vision with us.",
                            color: "purple"
                        },
                        {
                            icon: HiOutlineSparkles,
                            title: "2. Plan & Personalize",
                            description: "Connect with Ananya to discuss your ideas, preferences, and budget. We'll tailor every detail to match your dream.",
                            color: "pink"
                        },
                        {
                            icon: HiCheckCircle,
                            title: "3. Celebrate & Cherish",
                            description: "Relax and enjoy your perfectly executed event, creating memories that will last a lifetime. We handle everything!",
                            color: "teal"
                        }
                    ].map((step, index) => (
                        <div key={index}
                             className={`p-6 bg-gray-700/50 rounded-lg shadow-lg hover:shadow-${step.color}-500/30 transition-shadow duration-300 transform hover:-translate-y-1`}>
                            <step.icon className={`w-12 h-12 mx-auto mb-4 text-${step.color}-400`}/>
                            <h3 className="text-2xl font-semibold text-gray-100 mb-2">
                                {step.title}
                            </h3>
                            <p className="text-gray-400">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
            <section className="container mx-auto px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-3">
                        Event{" "}
                        <span
                            className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
              Decor Packages
            </span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Choose from our curated decor packages or let us design something
                        uniquely yours.
                    </p>
                </div>
                {loading ? (
                    <div className="text-center text-xl text-gray-400">
                        Loading decor packages...
                    </div>
                ) : offerings.length === 0 ? (
                    <div className="text-center text-xl text-gray-400">
                        No decor packages available right now. Please check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {offerings.slice(0, 3).map((offering) => (
                            <PublicOfferingCard
                                key={offering.id}
                                offering={offering}
                                modern={true}
                                globalDiscount={globalDiscount}
                            />
                        ))}
                    </div>
                )}
                {showRequestModal && selectedOffering && (
                    <RequestOfferingModal
                        offering={selectedOffering}
                        onClose={() => setShowRequestModal(false)}
                        modern={true}
                    />
                )}      </section>
            <section className="container mx-auto px-4 py-16 rounded-xl shadow-xl backdrop-blur-md">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-3">
                        Words From Our{" "}
                        <span
                            className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
              Happy Clients
            </span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        We love making dreams come true. Here's what some of our clients have
                        to say.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-gray-700/50 p-6 rounded-lg shadow-lg flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-green-500/30"
                        >
                            <img
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                className="w-20 h-20 rounded-full mb-4 border-2 border-green-400"
                            />
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <HiStar key={i} className="w-6 h-6 text-yellow-400"/>
                                ))}
                            </div>
                            <p className="text-gray-300 italic mb-4">
                                "{testimonial.quote}"
                            </p>
                            <h4 className="text-lg font-semibold text-gray-100">
                                - {testimonial.name}
                            </h4>
                            <p className="text-sm text-green-400">{testimonial.event}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className="container mx-auto px-4 text-center">
                <div
                    className="max-w-3xl mx-auto bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-red-600/20 p-8 md:p-12 rounded-xl shadow-2xl backdrop-blur-lg">
                    <div className="flex justify-center items-center mb-6">
                        <HiHeart className="w-8 h-8 mr-2 text-pink-500"/>
                        <HiGift className="w-8 h-8 mr-2 text-purple-400"/>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
                        About{" "}
                        <span
                            className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Eventify
            </span>
                    </h2>
                    <p className="text-lg text-gray-300 mb-6">
                        Eventify is born from a passion for creating beautiful, memorable
                        experiences. Ananya, our lead creative, pours her heart into every
                        event, ensuring it's not just a party, but a cherished memory in the
                        making. We specialize in personalized celebrations that reflect your
                        unique style and story.
                    </p>
                    <Link
                        to="/contact"
                        className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-md"
                    >
                        Get In Touch
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
