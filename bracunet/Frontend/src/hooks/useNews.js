import { useContext } from "react";
import { NewsContext } from "../context/NewsContext";

export const useNews = () => {
  return useContext(NewsContext);
};
