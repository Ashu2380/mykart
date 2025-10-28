import React from 'react';
import { useNavigate } from 'react-router-dom';

function TopNav() {
  const navigate = useNavigate();

  const categories = [
    { name: 'Electronics', path: '/collection?category=Electronics' },
    { name: 'Clothes', path: '/collection?category=Clothes' },
    { name: 'Home & Kitchen', path: '/collection?category=Home & Kitchen' },
    { name: 'Beauty & Health', path: '/collection?category=Beauty & Health' },
    { name: 'Sports & Outdoors', path: '/collection?category=Sports & Outdoors' },
    { name: 'Books & Media', path: '/collection?category=Books & Media' },
    { name: 'Toys & Games', path: '/collection?category=Toys & Games' },
  ];

  return (
    <div className="top-nav">
      <div className="top-nav-categories">
        {categories.map((cat, index) => (
          <button
            key={index}
            className="whitespace-nowrap hover:bg-blue-700 px-3 py-1 rounded-md transition-colors"
            onClick={() => navigate(cat.path)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TopNav;
