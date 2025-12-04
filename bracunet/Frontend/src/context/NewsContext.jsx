import { createContext, useState, useEffect } from "react";
import { getAllNews } from "../api/newsApi";
// import { getAllNews } from "../api/newsApi";

export const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await getAllNews();
      setNews(res.data);
    } catch (err) {
      console.error("Failed to load news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <NewsContext.Provider value={{ news, setNews, fetchNews, loading }}>
      {children}
    </NewsContext.Provider>
  );
};
