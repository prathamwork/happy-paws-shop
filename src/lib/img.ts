import { API_HOST } from "@/services/api";
import fallbackProduct from "@/assets/p-dogfood.jpg";
import fallbackCategory from "@/assets/cat-dog.jpg";

export const productImg = (path?: string | null) =>
  path ? (path.startsWith("http") ? path : API_HOST + path) : fallbackProduct;

export const categoryImg = (path?: string | null) =>
  path ? (path.startsWith("http") ? path : API_HOST + path) : fallbackCategory;

export const profileImg = (path?: string | null) =>
  path ? (path.startsWith("http") ? path : API_HOST + path) : "";
