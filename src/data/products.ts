import dogfood from "@/assets/p-dogfood.jpg";
import catfood from "@/assets/p-catfood.jpg";
import toy from "@/assets/p-toy.jpg";
import bed from "@/assets/p-bed.jpg";
import collar from "@/assets/p-collar.jpg";
import cage from "@/assets/p-cage.jpg";
import tank from "@/assets/p-tank.jpg";
import brush from "@/assets/p-brush.jpg";
import catDog from "@/assets/cat-dog.jpg";
import catCat from "@/assets/cat-cat.jpg";
import catBird from "@/assets/cat-bird.jpg";
import catFish from "@/assets/cat-fish.jpg";
import catAcc from "@/assets/cat-acc.jpg";

export type Category = "dogs" | "cats" | "birds" | "fish" | "accessories";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  tags: string[];
  bestSeller?: boolean;
  featured?: boolean;
  stock: number;
}

export const categories = [
  { id: "dogs" as Category, name: "Dogs", image: catDog, color: "bg-gradient-warm" },
  { id: "cats" as Category, name: "Cats", image: catCat, color: "bg-gradient-mint" },
  { id: "birds" as Category, name: "Birds", image: catBird, color: "bg-accent" },
  { id: "fish" as Category, name: "Fish", image: catFish, color: "bg-secondary" },
  { id: "accessories" as Category, name: "Accessories", image: catAcc, color: "bg-gradient-warm" },
];

export const products: Product[] = [
  {
    id: "1", name: "Premium Dry Dog Food — Chicken & Rice", brand: "Pawsome",
    category: "dogs", price: 42.99, originalPrice: 54.99, rating: 4.8, reviews: 1284,
    image: dogfood, bestSeller: true, featured: true, stock: 24,
    description: "High-protein, grain-friendly recipe with real chicken as the first ingredient. Crafted for adult dogs of all breeds. No artificial colors or flavors.",
    tags: ["grain-friendly", "high-protein", "adult"],
  },
  {
    id: "2", name: "Wild Caught Salmon Cat Food", brand: "Whiskertail",
    category: "cats", price: 18.50, originalPrice: 24.00, rating: 4.7, reviews: 892,
    image: catfood, bestSeller: true, featured: true, stock: 56,
    description: "Tender, flaky salmon in savory broth. Grain-free recipe loved by even the pickiest cats.",
    tags: ["grain-free", "wet-food", "salmon"],
  },
  {
    id: "3", name: "Squeaky Bone Chew Toy", brand: "PlayPaws",
    category: "dogs", price: 9.99, rating: 4.5, reviews: 432,
    image: toy, featured: true, stock: 120,
    description: "Durable rubber bone with built-in squeaker. Perfect for medium-sized dogs who love to play.",
    tags: ["toy", "interactive", "durable"],
  },
  {
    id: "4", name: "Cozy Cloud Pet Bed", brand: "Snuggle&Co",
    category: "accessories", price: 64.00, originalPrice: 89.00, rating: 4.9, reviews: 2103,
    image: bed, bestSeller: true, featured: true, stock: 18,
    description: "Plush memory-foam bed with raised edges for a sense of security. Machine washable cover.",
    tags: ["bed", "memory-foam", "washable"],
  },
  {
    id: "5", name: "Handcrafted Leather Collar", brand: "NobleHound",
    category: "accessories", price: 32.00, rating: 4.6, reviews: 318,
    image: collar, stock: 42,
    description: "Genuine leather with brushed gold buckle. Adjustable for a perfect fit. Built to last.",
    tags: ["leather", "premium", "adjustable"],
  },
  {
    id: "6", name: "Classic Bird Cage with Feeder", brand: "AviaryHome",
    category: "birds", price: 79.99, originalPrice: 99.99, rating: 4.4, reviews: 156,
    image: cage, stock: 12,
    description: "Spacious cage with built-in feeder and perch. Easy to clean removable tray.",
    tags: ["cage", "feeder", "spacious"],
  },
  {
    id: "7", name: "Aquarium Starter Tank — 20L", brand: "AquaLife",
    category: "fish", price: 119.00, originalPrice: 149.00, rating: 4.7, reviews: 287,
    image: tank, featured: true, stock: 8,
    description: "Crystal-clear glass tank with included filter, plants, and gravel. Everything you need to start.",
    tags: ["aquarium", "starter-kit", "20L"],
  },
  {
    id: "8", name: "Bamboo Grooming Brush", brand: "Pawsome",
    category: "accessories", price: 14.99, rating: 4.5, reviews: 521,
    image: brush, stock: 78,
    description: "Sustainable bamboo handle with soft bristles. Reduces shedding and leaves coats shiny.",
    tags: ["grooming", "bamboo", "eco"],
  },
];

export const getProduct = (id: string) => products.find(p => p.id === id);
export const getRelated = (id: string, category: Category) =>
  products.filter(p => p.id !== id && p.category === category).slice(0, 4);

export const brands = Array.from(new Set(products.map(p => p.brand)));
