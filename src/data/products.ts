import dogToy from "@/assets/prod-dog-toy.jpg";
import catToy from "@/assets/prod-cat-toy.jpg";
import dogWear from "@/assets/prod-dog-wear.jpg";
import catWear from "@/assets/prod-cat-wear.jpg";
import dogFood from "@/assets/prod-dog-food.jpg";
import catFood from "@/assets/prod-cat-food.jpg";
import type { Product } from "@/context/CartContext";

export const products: Product[] = [
  { id: "toy-dog-1", name: "Osso Squeaky", price: 39.9, image: dogToy, category: "brinquedos", pet: "caes" },
  { id: "toy-cat-1", name: "Vara com Plumas", price: 29.9, image: catToy, category: "brinquedos", pet: "gatos" },
  { id: "wear-dog-1", name: "Suéter Tricot", price: 119.9, image: dogWear, category: "roupas", pet: "caes" },
  { id: "wear-cat-1", name: "Hoodie Macio", price: 99.9, image: catWear, category: "roupas", pet: "gatos" },
  { id: "food-dog-1", name: "Ração Premium Cães 3kg", price: 89.9, image: dogFood, category: "racao", pet: "caes" },
  { id: "food-cat-1", name: "Ração Premium Gatos 3kg", price: 94.9, image: catFood, category: "racao", pet: "gatos" },
];
