import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Download,
  ExternalLink,
  Shield,
  Crown,
  Star,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import Loading from "../components/Loading/Loading";
import DownloadOptions from "../components/DownloadOptions";
import { linkvertise } from "../components/Linkvertise";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import LoadingBanned from "../components/Loaders/LoadingBanned";

type ContentItem = {
  id: number;
  name: string;
  mega: string;
  mega2: string;
  pixeldrain: string;
  AdmavenMega: string;
  AdmavenMega2: string;
  AdmavenPixeldrain: string;
  category: string;
  postDate: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  region: string;
};

const BannedContentDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [linkvertiseAccount, setLinkvertiseAccount] = useState<string>("518238");
  const [benefitsOpen, setBenefitsOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchLinkvertiseConfig = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/linkvertise-config`,
          {
            headers: {
              "x-api-key": `${import.meta.env.VITE_FRONTEND_API_KEY}`,
            },
          }
        );

        if (response.data && response.data.activeAccount) {
          setLinkvertiseAccount(response.data.activeAccount);
        }
      } catch (error) {
        console.error("Erro ao buscar configuração do Linkvertise:", error);
        setLinkvertiseAccount("518238");
      }
    };

    fetchLinkvertiseConfig();
  }, []);

  useEffect(() => {
    if (content) {
      linkvertise(linkvertiseAccount, {
        whitelist: ["mega.nz", "pixeldrain.com", "gofile.io"],
      });
    }
  }, [content, linkvertiseAccount]);

  function decodeModifiedBase64(encodedStr: string): any {
    const fixedBase64 = encodedStr.slice(0, 2) + encodedStr.slice(3);
    const jsonString = atob(fixedBase64);
    return JSON.parse(jsonString);
  }

  useEffect(() => {
    const fetchContentDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/bannedcontent/${slug}`,
          {
            headers: {
              "x-api-key": `${import.meta.env.VITE_FRONTEND_API_KEY}`,
            },
          }
        );

        if (!response.data || !response.data.data) {
          throw new Error("Resposta inválida do servidor");
        }

        const decodedContent = decodeModifiedBase64(response.data.data);
        setContent(decodedContent);
      } catch (error) {
        console.error("Error fetching content details:", error);
        setError("Failed to load content details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchContentDetails();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <LoadingBanned />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-gray-800/90 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link
            to="/banned"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to banned content
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-gray-800/90 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Content Not Found</h2>
          <p className="text-gray-300 mb-6">
            The banned content you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/banned"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to banned content
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Helmet>
        <title>Sevenxleaks - {content.name} (Banned)</title>
        <link rel="canonical" href={`https://sevenxleaks.com/banned/${content.slug}`} />
      </Helmet>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-gray-900 to-gray-900"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/banned"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700 hover:border-red-500/50 rounded-xl text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-red-500/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to banned content</span>
          </Link>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/90 backdrop-blur-xl border border-red-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900/40 to-red-800/40 px-6 py-6 border-b border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center shadow-xl">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-500/30 backdrop-blur-sm">
                <Shield className="w-3 h-3" />
                <span className="font-bold text-xs hidden sm:inline">BANNED CONTENT</span>
                <span className="font-bold text-xs sm:hidden">BANNED</span>
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-3xl font-bold text-white mb-4"
            >
              {content.name}
            </motion.h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-700/50 rounded-lg border border-gray-600/50 backdrop-blur-sm"
              >
                <Calendar className="w-4 h-4 text-red-400" />
                <span className="text-gray-300 text-xs sm:text-sm">
                  {formatDate(content.postDate)}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 backdrop-blur-sm"
              >
                <Tag className="w-4 h-4" />
                <span className="font-medium text-xs sm:text-sm">{content.category}</span>
              </motion.div>
            </div>
          </div>

          {/* Download Section */}
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <DownloadOptions
                primaryLinks={{
                  mega: content.mega,
                  mega2: content.mega2,
                  pixeldrain: content.pixeldrain,
                }}
              />
            </motion.div>

            {/* VIP Upgrade Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Crown className="w-4 h-4 text-black" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-yellow-400">Upgrade to VIP</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setBenefitsOpen((v) => !v)}
                  aria-expanded={benefitsOpen}
                  aria-controls="vip-benefits"
                  className="inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 rounded-md text-xs font-medium transition-all"
                >
                  <span className="hidden sm:inline">{benefitsOpen ? "Hide benefits" : "Show benefits"}</span>
                  <span className="sm:hidden">{benefitsOpen ? "Hide" : "Show"}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${benefitsOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <div
                id="vip-benefits"
                className={`grid grid-cols-2 gap-2 mb-4 overflow-hidden transition-all duration-300 ${
                  benefitsOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                }`}
              >
                {[
                  "Instant access without ads",
                  "All content unlocked",
                  "Premium download speeds",
                  "Exclusive VIP content",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
                    <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-check text-green-400 text-xs"></i>
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/plans"
                className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 text-xs sm:text-sm"
              >
                <Crown className="w-4 h-4" />
                <span>Unlock VIP Access</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BannedContentDetails;