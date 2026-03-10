import React, { useContext, useState, useEffect } from 'react';
import Nav from '../component/Nav';
import Sidebar from '../component/Sidebar';
import { authDataContext } from '../context/AuthContext';
import { adminDataContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../component/Loading';

function Categories() {
  let { serverUrl } = useContext(authDataContext);
  let { adminData } = useContext(adminDataContext);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await axios.get(serverUrl + "/api/category/getall");
      if (result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter category name");
      return;
    }
    try {
      const result = await axios.post(serverUrl + "/api/category/create", {
        name: newCategoryName,
        subcategories: []
      }, { withCredentials: true });
      
      if (result.data) {
        setCategories([...categories, result.data]);
        setNewCategoryName("");
        setShowAddCategory(false);
        toast.success("Category added!");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add category");
      }
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Delete "${categoryName}"?`)) return;
    try {
      await axios.delete(serverUrl + `/api/category/delete/${categoryId}`, {
        withCredentials: true
      });
      setCategories(categories.filter(c => c._id !== categoryId));
      toast.success("Category deleted!");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  // Add subcategory
  const handleAddSubcategory = async (categoryId) => {
    if (!newSubcategory.trim()) {
      toast.error("Please enter subcategory name");
      return;
    }
    try {
      const result = await axios.post(serverUrl + `/api/category/addsubcategory/${categoryId}`, {
        subcategory: newSubcategory
      }, { withCredentials: true });
      
      if (result.data) {
        setCategories(categories.map(c => c._id === categoryId ? result.data : c));
        setNewSubcategory("");
        setShowAddSubcategory(null);
        toast.success("Subcategory added!");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add subcategory");
      }
    }
  };

  // Delete subcategory
  const handleDeleteSubcategory = async (categoryId, subcategoryName) => {
    if (!window.confirm(`Delete "${subcategoryName}"?`)) return;
    try {
      const result = await axios.post(serverUrl + `/api/category/removesubcategory/${categoryId}`, {
        subcategory: subcategoryName
      }, { withCredentials: true });
      
      if (result.data) {
        setCategories(categories.map(c => c._id === categoryId ? result.data : c));
        toast.success("Subcategory deleted!");
      }
    } catch (error) {
      toast.error("Failed to delete subcategory");
    }
  };

  // Update category name
  const handleUpdateCategoryName = async (categoryId, newName) => {
    if (!newName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      const result = await axios.put(serverUrl + `/api/category/update/${categoryId}`, {
        name: newName,
        subcategories: categories.find(c => c._id === categoryId)?.subcategories || []
      }, { withCredentials: true });
      
      if (result.data) {
        setCategories(categories.map(c => c._id === categoryId ? result.data : c));
        setEditingCategory(null);
        toast.success("Category updated!");
      }
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  if (!adminData) {
    return (
      <div className='w-[100vw] min-h-[100vh] bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-[white] flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold mb-4'>Admin Access Required</h2>
          <p className='text-gray-300'>Please login as admin to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-[100vh] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 text-[black] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[calc(100vh-80px)] flex items-start justify-start overflow-y-auto absolute right-0 top-[80px] px-4 py-4'>
        <div className='w-full h-full flex flex-col gap-6 py-4 px-4 md:px-8'>
          
          {/* Header */}
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div>
              <h1 className='text-2xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'>
                Categories Management
              </h1>
              <p className='text-gray-500 mt-1'>Manage product categories and subcategories</p>
            </div>
            <div className='flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md'>
              <span className='w-2 h-2 bg-violet-500 rounded-full animate-pulse'></span>
              <span className='text-sm text-gray-600'>{categories.length} categories</span>
            </div>
          </div>

          {/* Add Category */}
          <div className='flex justify-end'>
            {!showAddCategory ? (
              <button 
                onClick={() => setShowAddCategory(true)}
                className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl'
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Category
              </button>
            ) : (
              <div className='flex gap-2 items-center'>
                <input 
                  type="text" 
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className='h-12 px-4 border-2 border-violet-300 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-200 outline-none'
                />
                <button 
                  onClick={handleAddCategory}
                  className='px-4 h-12 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all'
                >
                  Add
                </button>
                <button 
                  onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }}
                  className='px-4 h-12 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all'
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <Loading />
            </div>
          ) : (
            /* Categories List */
            <div className='space-y-4'>
              {categories.map((category, index) => (
                <div key={category._id || index} className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
                  {/* Category Header */}
                  <div className='p-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100'>
                    <div className='flex items-center justify-between'>
                      {editingCategory === category._id ? (
                        <div className='flex items-center gap-2 flex-1'>
                          <input 
                            type="text"
                            defaultValue={category.name}
                            id={`edit-${category._id}`}
                            className='flex-1 h-10 px-3 border-2 border-violet-300 rounded-lg focus:border-violet-500 outline-none'
                          />
                          <button 
                            onClick={() => {
                              const input = document.getElementById(`edit-${category._id}`);
                              handleUpdateCategoryName(category._id, input.value);
                            }}
                            className='px-3 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600'
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingCategory(null)}
                            className='px-3 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300'
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center'>
                              <span className='text-white font-bold'>{category.name[0]}</span>
                            </div>
                            <div>
                              <h3 className='text-lg font-semibold text-gray-800'>{category.name}</h3>
                              <p className='text-sm text-gray-500'>{category.subcategories?.length || 0} subcategories</p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <button 
                              onClick={() => setEditingCategory(category._id)}
                              className='p-2 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors'
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(category._id, category.name)}
                              className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className='p-4'>
                    <div className='flex flex-wrap gap-2'>
                      {category.subcategories?.map((sub, subIndex) => (
                        <div 
                          key={subIndex}
                          className='flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg group'
                        >
                          <span className='text-gray-700 font-medium'>{sub}</span>
                          <button 
                            onClick={() => handleDeleteSubcategory(category._id, sub)}
                            className='w-4 h-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all'
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      {/* Add Subcategory */}
                      {showAddSubcategory === category._id ? (
                        <div className='flex items-center gap-1'>
                          <input 
                            type="text"
                            placeholder="Subcategory name"
                            value={newSubcategory}
                            onChange={(e) => setNewSubcategory(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddSubcategory(category._id);
                              if (e.key === 'Escape') { setShowAddSubcategory(null); setNewSubcategory(""); }
                            }}
                            className='h-8 px-2 text-sm border-2 border-violet-300 rounded-lg focus:border-violet-500 outline-none'
                            autoFocus
                          />
                          <button 
                            onClick={() => handleAddSubcategory(category._id)}
                            className='h-8 px-2 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600'
                          >
                            Add
                          </button>
                          <button 
                            onClick={() => { setShowAddSubcategory(null); setNewSubcategory(""); }}
                            className='h-8 px-2 text-gray-500 hover:text-gray-700'
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowAddSubcategory(category._id)}
                          className='flex items-center gap-1 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors'
                        >
                          <span className='text-xl'>+</span>
                          <span className='text-sm'>Add Subcategory</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Card */}
          <div className='bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-xl font-bold'>Total Categories</h3>
                <p className='text-violet-200'>{categories.length} main categories</p>
              </div>
              <div className='text-4xl font-bold'>
                {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)}
              </div>
            </div>
            <p className='text-violet-200 mt-2'>Total subcategories across all categories</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
