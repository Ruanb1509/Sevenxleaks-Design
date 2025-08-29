import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

type LinkItem = {
  id: string;
  name: string;
  category: string;
  postDate: string;
  slug: string;
  thumbnail?: string;
  createdAt: string;
  contentType?: string;
};

type Category = {
  id: string;
  name: string;
  category: string;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-spin"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fa-solid fa-spinner text-purple-500 animate-spin text-xl"></i>
      </div>
    </div>
  </div>
);

const AsianPage: React.FC = () => {
  const navigate = useNavigate();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  function decodeModifiedBase64<T>(encodedStr: string): T {
    const fixedBase64 = encodedStr.slice(0, 2) + encodedStr.slice(3);
    const jsonString = atob(fixedBase64);
    return JSON.parse(jsonString) as T;
  }

  const fetchContent = async (page: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      setSearchLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        sortBy: "postDate",
        sortOrder: "DESC",
        limit: "24",
      });

      if (searchName) {
        params.append('search', searchName);
      }
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (dateFilter !== 'all') {
        const today = new Date();
        let targetDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            break;
          case 'yesterday':
            targetDate.setDate(today.getDate() - 1);
            break;
          case '7days':
            targetDate.setDate(today.getDate() - 7);
            break;
        }
        
        params.append('month', (targetDate.getMonth() + 1).toString().padStart(2, '0'));
      }

      const endpoint = searchName ? '/asiancontent/search' : '/asiancontent';
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}?${params}`,
        {
          headers: {
            "x-api-key": `${import.meta.env.VITE_FRONTEND_API_KEY}`,
          },
        }
      );
      if (!response.data?.data) {
        throw new Error("Invalid server response");
      }

      const decoded = decodeModifiedBase64<{ data: LinkItem[]; totalPages: number }>(
        response.data.data
      );

      const { data: rawData, totalPages } = decoded;

      if (isLoadMore) {
        setLinks((prev) => [...prev, ...rawData]);
        setFilteredLinks((prev) => [...prev, ...rawData]);
      } else {
        setLinks(rawData);
        setFilteredLinks(rawData);
      }

      setTotalPages(totalPages);
      setHasMoreContent(page < totalPages);

      const uniqueCategories = Array.from(
        new Set(rawData.map((item) => item.category))
      ).map((category) => ({
        id: category,
        name: category,
        category,
      }));

      setCategories((prev) => {
        const existingCategories = new Set(prev.map((c) => c.category));
        const newCategories = uniqueCategories.filter(
          (c) => !existingCategories.has(c.category)
        );
        return [...prev, ...newCategories];
      });
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchContent(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchName, selectedCategory, dateFilter]);

  const handleLoadMore = () => {
    if (loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchContent(nextPage, true);
  };

  const recentLinks = filteredLinks.slice(0, 5);

  const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const groupPostsByDate = (posts: LinkItem[]) => {
    const grouped: { [key: string]: LinkItem[] } = {};
    
    posts.forEach(post => {
      const dateKey = formatDateHeader(post.postDate || post.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(post);
    });
    
    return grouped;
  };

  const groupedLinks = groupPostsByDate(filteredLinks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Helmet>
        <title>Sevenxleaks Western - Free Content</title>
        <link rel="canonical" href="https://sevenxleaks.com/western" />
      </Helmet>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center gap-4 bg-gray-700/50 rounded-2xl px-6 py-4 border border-gray-600/30 shadow-inner">
            {/* Search Bar */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <i className="fa-solid fa-search text-purple-400 text-lg"></i>
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              {searchLoading && (
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              {["all", "today", "yesterday", "7days"].map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border whitespace-nowrap ${
                    dateFilter === filter
                      ? "bg-purple-500 text-white border-purple-400"
                      : "bg-gray-700/50 text-gray-300 hover:bg-purple-500/20 border-gray-600/50"
                  }`}
                  onClick={() => setDateFilter(filter)}
                >
                  {filter === "all"
                    ? "All"
                    : filter === "7days"
                    ? "7 Days"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all duration-300 hover:bg-gray-600/50 min-w-[120px]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.category}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
              <button 
                className="p-2 bg-gray-700/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 rounded-lg transition-all duration-300 border border-gray-600/50" 
                title="Calendar View"
              >
                <i className="fa-regular fa-calendar text-sm"></i>
              </button>
              <button 
                className="p-2 bg-gray-700/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 rounded-lg transition-all duration-300 border border-gray-600/50" 
                title="Switch to Asian"
                onClick={() => navigate('/western')}
              >
                <i className="fa-solid fa-repeat text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <main>
          {loading ? (
            <LoadingSpinner />
          ) : filteredLinks.length > 0 ? (
            <>
              {Object.entries(groupedLinks)
                .sort(([dateA], [dateB]) => {
                  const parseDateA = new Date(dateA);
                  const parseDateB = new Date(dateB);
                  return parseDateB.getTime() - parseDateA.getTime();
                })
                .map(([date, posts]) => (
                  <div key={date} className="mb-8">
                    <h2 className="text-xl font-bold text-gray-300 mb-4 pb-2 border-b border-gray-700/50 font-orbitron flex items-center gap-3">
                      <div
                        className={`w-3 h-8 rounded-full shadow-lg ${
                          posts.every(p => (p.contentType || 'western') === 'western')
                            ? 'bg-gradient-to-b from-purple-500 to-puple-600 shadow-purple-500/30'
                            : 'bg-gradient-to-b from-purple-500 to-purple-600 shadow-purple-500/30'
                        }`}
                      ></div>
                      <span
                        className={`bg-clip-text text-transparent ${
                          posts.every(p => (p.contentType || 'western') === 'western')
                            ? 'bg-gradient-to-r from-purple-400 to-purple-300'
                            : 'bg-gradient-to-r from-purple-400 to-purple-300'
                        }`}
                      >
                        {date}
                      </span>
                    </h2>
                    <div className="space-y-2">
                      {posts
                        .sort((a, b) => new Date(b.postDate || b.createdAt).getTime() - new Date(a.postDate || a.createdAt).getTime())
                        .map((link, index) => (
                          <motion.div
                            key={link.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700/50 rounded-xl p-3 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-[1.01] ${
                              (link.contentType || 'western') === 'western'
                                ? 'hover:border-purple-500/50 hover:shadow-purple-500/10'
                                : 'hover:border-purple-500/50 hover:shadow-purple-500/10'
                            }`}
                            onClick={() => {
                              const contentType = link.contentType || 'western';
                              switch (contentType) {
                                case 'asian':
                                  navigate(`/asian/${link.slug}`);
                                  break;
                                case 'banned':
                                  navigate(`/banned/${link.slug}`);
                                  break;
                                case 'unknown':
                                  navigate(`/unknown/${link.slug}`);
                                  break;
                                case 'vip':
                                  navigate(`/vip/${link.slug}`);
                                  break;
                                default:
                                  navigate(`/western/${link.slug}`);
                              }
                            }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                {/* Indicador (inclui western em laranja) */}
                                {link.contentType && (
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      link.contentType === 'asian' ? 'bg-purple-400' :
                                      link.contentType === 'banned' ? 'bg-red-400' :
                                      link.contentType === 'unknown' ? 'bg-gray-400' :
                                      link.contentType === 'vip' ? 'bg-yellow-400' :
                                      link.contentType === 'western' ? 'bg-orange-400' : 'bg-purple-400'
                                    }`}
                                  ></div>
                                )}

                                <h3
                                  className={`text-sm sm:text-lg font-bold text-white transition-colors duration-300 font-orbitron relative group-hover:${
                                    (link.contentType || 'western') === 'western' ? 'text-purple-300' : 'text-purple-300'
                                  } truncate`}
                                >
                                  {link.name}
                                  <div
                                    className={`absolute -bottom-1 left-0 w-16 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                      (link.contentType || 'western') === 'western'
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-300'
                                        : 'bg-gradient-to-r from-purple-500 to-purple-300'
                                    }`}
                                  ></div>
                                </h3>

                                <div
                                  className={`hidden sm:block h-px flex-1 max-w-20 transition-all duration-300 ${
                                    (link.contentType || 'western') === 'western'
                                      ? 'bg-gradient-to-r from-purple-500/50 to-transparent group-hover:from-purple-400/70'
                                      : 'bg-gradient-to-r from-purple-500/50 to-transparent group-hover:from-purple-400/70'
                                  }`}
                                ></div>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                {recentLinks.includes(link) && (
                                  <span className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 text-white text-xs font-bold rounded-full shadow-lg animate-pulse border font-roboto ${
                                    (link.contentType || 'western') === 'western'
                                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400/30'
                                      : 'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400/30'
                                  }`}>
                                    <i className="fa-solid fa-star mr-1 text-xs hidden sm:inline"></i>
                                    NEW
                                  </span>
                                )}

                                {/* Badge do tipo de conteúdo (inclui western em laranja) */}
                                {link.contentType && (
                                  <span
                                    className={`inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                                      link.contentType === 'asian'
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : link.contentType === 'banned'
                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        : link.contentType === 'unknown'
                                        ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                        : link.contentType === 'vip'
                                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                        : link.contentType === 'western'
                                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                        : ''
                                    }`}
                                  >
                                    {link.contentType.toUpperCase()}
                                  </span>
                                )}

                                <span className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 bg-gray-700/70 text-gray-300 text-xs sm:text-sm font-medium rounded-full border border-gray-600/50 backdrop-blur-sm font-roboto">
                                  <i className="fa-solid fa-tag mr-1 sm:mr-2 text-xs"></i>
                                  {link.category}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}

              {hasMoreContent && (
                <div className="text-center mt-12">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-10 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed border border-purple-400/30 backdrop-blur-sm font-orbitron"
                  >
                    {loadingMore ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-3"></i>
                        Loading More...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus mr-3"></i>
                        Load More Content
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="mb-8">
                <i className="fa-solid fa-search text-6xl text-gray-500"></i>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white font-orbitron">No Content Found</h3>
              <p className="text-gray-400 text-lg font-roboto">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AsianPage;
