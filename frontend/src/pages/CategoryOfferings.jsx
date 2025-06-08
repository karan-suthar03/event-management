import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicOfferingCard from "../components/PublicOfferingCard";
import RequestOfferingModal from "../components/RequestOfferingModal";
import apiService from "../utils/apiService";

const CategoryOfferings = () => {
  const { name } = useParams();
  const [offerings, setOfferings] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const categories = await apiService.get("/api/offerings/categories-with-count");
        setCategories(categories);
        const cat = categories.find(c => c.name === name);
        setCategory(cat || { name });
        const data = await apiService.get(`/api/offerings/by-main-category?name=${encodeURIComponent(name)}`);
        setOfferings(data);
      } catch (e) {
        setError("Could not load offerings.");
      }
      setLoading(false);
    };
    fetchData();
  }, [name]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-yellow-50 p-8">
      <section className="max-w-7xl mx-auto bg-gradient-to-br from-fuchsia-50 via-pink-50 to-yellow-50 rounded-3xl shadow-2xl border-4 border-fuchsia-100 px-2 md:px-10 py-12">
        <button
          className="mb-6 text-fuchsia-600 hover:underline font-bold flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <span aria-hidden>←</span> Back to All Offerings
        </button>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-fuchsia-700 font-cursive flex items-center gap-2">
          <span role="img" aria-label="cat-emoji">{category?.emoji}</span> {category?.name} Decor Packages
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-pink-300 via-yellow-200 to-fuchsia-300 rounded-full mb-10 mx-auto"></div>
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <button
            className={`px-4 py-1.5 rounded-full font-bold border transition text-sm ${name === '' ? 'bg-fuchsia-400 text-white border-fuchsia-400' : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100'}`}
            onClick={() => navigate('/offerings')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`px-4 py-1.5 rounded-full font-bold border transition text-sm flex items-center gap-1 ${cat.name === name ? 'bg-fuchsia-400 text-white border-fuchsia-400' : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100'}`}
              onClick={() => navigate(`/offerings/category/${encodeURIComponent(cat.name)}`)}
            >
              <span>{cat.emoji}</span> {cat.name}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-pink-400 text-center">Loading offerings...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : offerings.length === 0 ? (
          <div className="text-fuchsia-400 text-center">No offerings in this category right now.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-center">
            {offerings.map(offering => (
              <PublicOfferingCard
                key={offering.id}
                offering={offering}
                onRequest={off => { setSelectedOffering(off); setShowRequestModal(true); }}
              />
            ))}
          </div>
        )}
        {showRequestModal && selectedOffering && (
          <RequestOfferingModal offering={selectedOffering} onClose={() => setShowRequestModal(false)} />
        )}
      </section>
    </div>
  );
};

export default CategoryOfferings;
