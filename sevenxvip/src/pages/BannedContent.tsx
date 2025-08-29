import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Calendar, LayoutGrid, SortDesc, ChevronDown, Shield, AlertTriangle, Filter } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useRegion } from "../contexts/RegionContext";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import LoadingBanned from "../components/Loaders/LoadingBanned";

type LinkItem = {
  id: string;
  name: string;
  category: string;
  postDate: string;
  slug: string;
  mega: string;
  mega2?: string;
  pixeldrain?: string;
  thumbnail?: string;
  createdAt: string;
  region: string;
  contentType?: string;
};

const months = [
  { value: "", label: "All Months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];


const BannedContent: React.FC = () => {
  const navigate = useNavigate();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<LinkItem[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("mostRecent");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const { theme } = useTheme();
  const { region } = useRegion();

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
      
      if (selectedMonth) {
        params.append('month', selectedMonth);
      }

      const endpoint = searchName ? '/bannedcontent/search' : '/bannedcontent';
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
    } catch (error) {
      console.error("Error fetching banned content:", error);
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
  }, [searchName, selectedMonth, sortOption, region]);

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
    <div className="dreamy-page">
      <Helmet>
        <title>Banned Content - Sevenxleaks</title>
        <link rel="canonical" href="https://sevenxleaks.com/banned" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-4 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-12 h-12 text-red-500" />
            </motion.div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
              Banned Content
            </h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-lg text-red-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Content banned from Erome
          </motion.p>
        </motion.div>

        {/* Filter Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-4 bg-gray-700/50 rounded-2xl px-6 py-4 border border-gray-600/30 shadow-inner">
              {/* Search Bar */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AlertTriangle className="text-red-400 w-5 h-5" />
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg"
                  placeholder="Search banned content..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                {searchLoading && (
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all duration-300 hover:bg-gray-600/50 min-w-[120px]"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all duration-300 hover:bg-gray-600/50 min-w-[120px]"
                >
                  <option value="mostRecent">Most Recent</option>
                  <option value="oldest">Oldest</option>
                </select>

                <button 
                  className="p-2 bg-gray-700/50 hover:bg-red-500/20 text-gray-300 hover:text-red-300 rounded-lg transition-all duration-300 border border-gray-600/50" 
                  title="Calendar View"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <main>
            {loading ? (
              <LoadingBanned />
            ) : filteredLinks.length > 0 ? (
              <>
                {Object.entries(groupedLinks)
                  .sort(([dateA], [dateB]) => {
                    const parseDateA = new Date(dateA);
                    const parseDateB = new Date(dateB);
                    return parseDateB.getTime() - parseDateA.getTime();
                  })
                  .map(([date, posts]) => (
                    <div key={date} className="mb-6">
                      <h2 className="text-xl font-bold text-gray-300 mb-4 pb-2 border-b border-gray-700/50 font-orbitron flex items-center gap-3">
                        <div className="w-3 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30"></div>
                        <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">{date}</span>
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
                            className="group bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700/50 hover:border-red-500/50 rounded-xl p-3 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-red-500/10 transform hover:scale-[1.01]"
                            onClick={() => {
                              const contentType = link.contentType || 'banned';
                              switch (contentType) {
                                case 'asian':
                                  navigate(`/asian/${link.slug}`);
                                  break;
                                case 'western':
                                  navigate(`/western/${link.slug}`);
                                  break;
                                case 'unknown':
                                  navigate(`/unknown/${link.slug}`);
                                  break;
                                case 'vip':
                                  navigate(`/vip/${link.slug}`);
                                  break;
                                default:
                                  navigate(`/banned/${link.slug}`);
                              }
                            }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                {link.contentType && link.contentType !== 'banned' && (
                                  <div className={`w-2 h-2 rounded-full ${
                                    link.contentType === 'asian' ? 'bg-purple-400' :
                                    link.contentType === 'western' ? 'bg-orange-400' :
                                    link.contentType === 'unknown' ? 'bg-gray-400' :
                                    link.contentType === 'vip' ? 'bg-yellow-400' : 'bg-red-400'
                                  }`}></div>
                                )}
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <h3 className="text-sm sm:text-lg font-bold text-white group-hover:text-red-300 transition-colors duration-300 font-orbitron relative truncate">
                                  {link.name}
                                  <div className="absolute -bottom-1 left-0 w-16 h-0.5 bg-gradient-to-r from-red-500 to-red-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </h3>
                                <div className="hidden sm:block h-px bg-gradient-to-r from-red-500/50 to-transparent flex-1 max-w-20 group-hover:from-red-400/70 transition-all duration-300"></div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                {recentLinks.includes(link) && (
                                  <span className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse border border-red-400/30 font-roboto">
                                    <i className="fa-solid fa-star mr-1 text-xs hidden sm:inline"></i>
                                    NEW
                                  </span>
                                )}
                                {link.contentType && link.contentType !== 'banned' && (
                                  <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                                    link.contentType === 'asian' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                    link.contentType === 'western' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                    link.contentType === 'unknown' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                    link.contentType === 'vip' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : ''
                                  }`}>
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
                      className="px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed border border-red-400/30 backdrop-blur-sm font-orbitron"
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
                <h3 className="text-3xl font-bold mb-4 text-white font-orbitron">
                  No Banned Content Found
                </h3>
                <p className="text-gray-400 text-lg font-roboto">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BannedContent;