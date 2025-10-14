/**
 * ProductGrid component for displaying similar products in a responsive grid
 */
import ProductCard from './ProductCard';
import { Product } from '../types/product';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">No products found</div>
        <p className="text-gray-500 mt-2">Upload an image to find similar products</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
