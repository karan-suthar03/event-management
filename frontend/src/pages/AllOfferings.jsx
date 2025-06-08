import React, { useEffect, useState } from "react";
import { HiOutlineGift, HiViewColumns, HiExclamationTriangle, HiMagnifyingGlassPlus } from "react-icons/hi2";
import PublicOfferingCard from "../components/PublicOfferingCard";
import RequestOfferingModal from "../components/RequestOfferingModal";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/apiService";

const AllOfferings = ({ globalDiscount }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sort, setSort] = useState("");
  const [filteredSections, setFilteredSections] = useState([]);
  const [displayAsFlatList, setDisplayAsFlatList] = useState(false);
  const navigate = useNavigate();

  const fetchFilteredOfferings = async () => {
    setLoading(true);
    setError("");

    const activeGeneralFilters = !!search || !!priceRange || !!sort;
    setDisplayAsFlatList(activeGeneralFilters);

    try {
      const query = new URLSearchParams({
        search,
        sort,
        priceRange,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      const data = await apiService.get(`/api/offerings/search?${query.toString()}`);
      
      if (data.length === 0) {
        setFilteredSections([]);
      } else {
        if (activeGeneralFilters) {
          setFilteredSections([{ 
            id: 'flat-list-results', 
            name: 'Filtered Packages', 
            offerings: data, 
            isFlat: true, 
            emoji: '🔍' 
          }]);
        } else {
          const grouped = {};
          data.forEach(off => {
            const catName = off.mainCategory?.name || "Other";
            const sectionId = off.mainCategory?.id !== undefined && off.mainCategory?.id !== null ? off.mainCategory.id : catName;
            if (!grouped[catName]) {
              grouped[catName] = { 
                ...(off.mainCategory || {}),
                id: sectionId, 
                name: catName, 
                offerings: [], 
                isFlat: false 
              };
            }
            grouped[catName].offerings.push(off);
          });
          const sortedSections = Object.values(grouped).sort((a, b) => b.offerings.length - a.offerings.length);
          setFilteredSections(sortedSections);
        }
      }
    } catch (e) {
      setError("Could not load offerings.");
      setFilteredSections([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFilteredOfferings();
  }, [search, priceRange, sort, selectedCategory]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.get('/api/offerings/categories-with-count');
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <section className="max-w-7xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-10">        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-sky-400 flex items-center justify-center gap-3">
            <HiOutlineGift className="h-10 w-10 text-sky-500" />
            Event Decor Packages
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Explore our curated decor packages. Find the perfect ambiance for your celebration or request a bespoke design.</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-4 mb-8 w-full max-w-4xl mx-auto px-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search packages..."
            className="flex-grow px-5 py-2.5 rounded-full bg-slate-700 text-sky-200 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-base shadow-sm min-w-0 w-full md:w-auto"
          />
          <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap items-center justify-center sm:justify-start md:justify-center gap-3 md:gap-4 flex-shrink-0">
            <select
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-slate-700 text-sky-200 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-base shadow-sm"
            >
              <option value="">All Prices</option>
              <option value="0-4999">Under ₹5,000</option>
              <option value="5000-9999">₹5,000 - ₹9,999</option>
              <option value="10000-19999">₹10,000 - ₹19,999</option>
              <option value="20000-49999">₹20,000 - ₹49,999</option>
              <option value="50000-99999">₹50,000 - ₹99,999</option>
              <option value="100000-9999999">₹1,00,000+</option>
            </select>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-slate-700 text-sky-200 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-base shadow-sm"
            >
              <option value="">Sort By</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
              <button
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-sky-600 text-white border border-sky-500 hover:bg-sky-700 transition-all font-semibold text-base shadow-sm"
                onClick={() => fetchFilteredOfferings()}
              >
                Apply
              </button>
              {(priceRange || sort || search) && (
                <button
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-slate-600 text-sky-200 border border-slate-500 hover:bg-slate-600 hover:text-white hover:border-sky-600 transition-all font-semibold text-base shadow-sm"
                  onClick={() => { setPriceRange(""); setSort(""); setSearch(""); }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mb-10 p-4 bg-slate-700/50 rounded-xl shadow flex flex-wrap gap-3 justify-center items-center w-full max-w-5xl mx-auto">            <button 
              className={`px-5 py-2 rounded-full font-medium border-2 transition-all duration-200 text-sm flex items-center gap-2 shadow-sm ${selectedCategory === 'All' ? 'bg-sky-500 text-white border-sky-500' : 'bg-slate-600 text-slate-300 border-slate-500 hover:bg-sky-600 hover:text-white hover:border-sky-600'}`}
              onClick={() => setSelectedCategory('All')}
            >
              <HiViewColumns className="h-5 w-5" />
              All Packages
            </button>
            {(showAllCategories ? categories : categories.slice(0, 7)).map(cat => (
              <button
                key={cat.id}
                className={`px-5 py-2 rounded-full font-medium border-2 transition-all duration-200 text-sm flex items-center gap-2 shadow-sm ${selectedCategory === cat.name ? 'bg-sky-500 text-white border-sky-500' : 'bg-slate-600 text-slate-300 border-slate-500 hover:bg-sky-600 hover:text-white hover:border-sky-600'}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <span className="text-lg">{cat.emoji}</span> {cat.name}
              </button>
            ))}
            {categories.length > 7 && (
              <button
                className="px-5 py-2 rounded-full font-medium border-2 bg-slate-700 text-sky-400 border-slate-500 hover:bg-sky-700 hover:text-white hover:border-sky-600 transition-all duration-200 text-sm shadow-sm"
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                {showAllCategories ? 'Show Less' : 'More Categories...'}
              </button>
            )}
          </div>
        )}

        <main className="flex-1">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
              <p className="text-sky-400 text-lg">Loading awesome packages...</p>
            </div>          ) : error ? (
            <div className="text-center py-10 bg-red-900/20 p-6 rounded-lg">
              <HiExclamationTriangle className="h-12 w-12 mx-auto text-red-400 mb-3" />
              <p className="text-red-400 text-xl font-semibold">Oops! Something went wrong.</p>
              <p className="text-red-500">{error}</p>
            </div>          ) : filteredSections.length === 0 ? (
            <div className="text-center py-10">
              <HiMagnifyingGlassPlus className="h-16 w-16 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400 text-lg">No packages found for your filters.</p>
              <p className="text-slate-500">Try changing your search or price range.</p>
            </div>
          ) : displayAsFlatList ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredSections[0].offerings.map(offering => (
                <PublicOfferingCard
                  key={offering.id}
                  offering={offering}
                  modern={true}
                  globalDiscount={globalDiscount}
                  onRequest={off => { setSelectedOffering(off); setShowRequestModal(true); }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-12 md:gap-16">
              {(showAllCategories ? filteredSections : filteredSections.slice(0, 6)).map(section => (
                section.offerings && section.offerings.length > 0 && !section.isFlat && (
                  <section key={section.id || section.name} id={`category-${section.id || section.name}`}>
                    <div className="flex items-center mb-6 md:mb-8 pb-3 border-b-2 border-slate-700">
                      {section.emoji && <span className="text-3xl mr-3">{section.emoji}</span>}
                      <h2 className="text-2xl md:text-3xl font-semibold text-sky-300">{section.name || section.title || 'Category'}</h2>
                      <span className="ml-3 text-sm bg-slate-700 text-sky-400 px-2.5 py-1 rounded-full font-medium">{section.offerings.length} packages</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                      {(section.showAllOfferings ? section.offerings : section.offerings.slice(0, 6)).map(offering => (
                        <PublicOfferingCard
                          key={offering.id}
                          offering={offering}
                          modern={true}
                          globalDiscount={globalDiscount}
                          onRequest={off => { setSelectedOffering(off); setShowRequestModal(true); }}
                        />
                      ))}
                      {section.offerings.length > 6 && (
                        <div className="col-span-full flex justify-center mt-4">
                          <button
                            className="px-4 py-2 rounded-full font-semibold bg-slate-700 text-sky-400 border-2 border-sky-500 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all duration-200 shadow-sm"
                            onClick={() => {
                              setFilteredSections(prev => prev.map(s =>
                                s.id === section.id ? { ...s, showAllOfferings: !s.showAllOfferings } : s
                              ));
                            }}
                          >
                            {section.showAllOfferings ? 'Show Less' : 'Show More'}
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                )
              ))}
            </div>
          )}
          {showRequestModal && selectedOffering && (
            <RequestOfferingModal 
              offering={selectedOffering} 
              modern={true}
              onClose={() => setShowRequestModal(false)} 
            />
          )}
        </main>
      </section>
    </div>
  );
};

export default AllOfferings;
