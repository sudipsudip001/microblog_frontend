import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, Edit2, X } from 'lucide-react';
import './App.css'

interface Book{
  id: number;
  book_name: string;
  author_name: string;
  isbn: number;
}

interface BookFormData {
  book_name: string;
  author_name: string;
  isbn: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    book_name: '',
    author_name: '',
    isbn: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBooks = async () => {
    try{
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books`);
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
      setError('');
    }catch(err){
      setError('Failed to load books. Make sure API is running.');
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!formData.book_name || !formData.author_name || !formData.isbn){
      setError('All fields are required');
      return;
    }

    try{
      setLoading(true);
      const bookData = {
        book_name: formData.book_name,
        author_name: formData.author_name,
        isbn: parseInt(formData.isbn)
      };

      const url = editingBook
        ? `${API_BASE_URL}/books/${editingBook.id}`
        : `${API_BASE_URL}/books`;

      const method = editingBook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(bookData)
      });

      if (!response.ok) throw new Error('Failed to save book');

      await fetchBooks();
      resetForm();
      setError('');
    }catch(err){
      setError('Failed to save book');
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try{
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete book');

      await fetchBooks();
      setError('');
    }catch(err){
      setError('Failed to delete book');
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      book_name: book.book_name,
      author_name: book.author_name,
      isbn: book.isbn.toString()
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({ book_name: '', author_name: '', isbn: ''});
    setEditingBook(null);
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Bookstore Manager</h1>
            </div>
            <button onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Add Book
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-betwee mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Book Name
                  </label>
                  <input
                    type='text'
                    value={formData.book_name}
                    onChange={(e) => setFormData({ ...formData, book_name: e.target.value})}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    placeholder='Enter book name'
                    />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Author Name
                  </label>
                  <input
                    type='text'
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value})}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    placeholder='Enter author name'
                    />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    ISBN
                  </label>
                  <input
                    type='number'
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value})}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    placeholder='Enter ISBN'
                    />
                </div>

                <div className='flex gap-3 pt-4'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50'
                  >
                    {editingBook ? 'Update' : 'Create'}
                  </button>
                  <button
                    type='button'
                    onClick={resetForm}
                    className='flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition'>
                      Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && books.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            Loading books...
          </div>) : books.length == 0 ?(
          <div className='bg-white rounded-lg shadow-lg p-12 text-center'>
            <BookOpen className='bg-white rounded-lg shadow-lg p-12 text-center' />
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>No books yet</h3>
            <p className='text-gray-500'>Click "Add Book" to get started</p>
          </div>
        ): (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {books.map((book) => (
              <div key={book.id} className='bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition'>
                <div className="flex items-start justify-between mb-3">
                  <BookOpen className='w-8 h-8 text-indigo-600' />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className='text-blue-600 hover:text-blue-800 transition'
                    >
                      <Edit2 className='w-5 h-5' />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className='text-red-600 hover:text-red-800 transition'
                    >
                      <Trash2 className='w-5 h5' />
                    </button>
                  </div>
                </div>

                <h3 className='text-xl font-bold text-gray-800 mb-2'>{book.book_name}</h3>
                <p className='text-gray-600 mb-1'>by {book.author_name}</p>
                <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
