import React, { useState } from "react";
import { 
  HiPhone, 
  HiEnvelope, 
  HiHeart,
  HiPaperAirplane,
  HiCheckCircle
} from "react-icons/hi2";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setForm({
        name: "",
        email: "",
        message: ""
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: HiPhone,
      title: "Call Us",
      info: "+91 98765 43210",
      description: "Mon-Sat, 10 AM - 8 PM",
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      icon: HiEnvelope,
      title: "Email Us",
      info: "hello@eventify.com",
      description: "We'll respond within 24 hours",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    }, ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Get In Touch
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to create your dream event? Let's discuss your vision and bring it to life with our expertise and creativity.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-2xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="flex items-center mb-8">
                <HiHeart className="w-8 h-8 text-pink-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-100">
                  Tell Us About Your Event
                </h2>
              </div>
              {success && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-xl flex items-center">
                  <HiCheckCircle className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <p className="text-green-300 font-semibold">Message sent successfully!</p>
                    <p className="text-green-400 text-sm">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl">
                  <p className="text-red-300">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Tell us about your vision *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-y"
                    placeholder="Describe your event ideas, theme preferences, guest count, or any specific requirements..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <HiPaperAirplane className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-gray-600 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${item.bgColor}`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-1">
                        {item.title}
                      </h3>
                      <p className={`font-medium ${item.color} mb-1`}>
                        {item.info}
                      </p>
                      <p className="text-sm text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6 text-center">
              <HiCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-green-300 mb-2">
                Quick Response Promise
              </h4>
              <p className="text-green-200 text-sm">
                We'll respond to your inquiry within 24 hours with a personalized consultation offer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
