'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_PASSWORD = 'f4S2[2;hs)d]';

type Project = {
  title: string;
  slug: string;
  category: 'commercial' | 'retail' | 'residential' | 'civil';
  location: string;
  client_name: string;
  testimonial: string;
  description: string;
  year: number;
  area: string;
  duration: string;
  featured: boolean;
  tags: string[];
  cover_image?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<Project>({
    title: '',
    slug: '',
    category: 'commercial',
    location: '',
    client_name: '',
    testimonial: '',
    description: '',
    year: new Date().getFullYear(),
    area: '',
    duration: '',
    featured: false,
    tags: [],
    cover_image: '',
  });

  const [tagInput, setTagInput] = useState('');

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setError('Invalid password');
    }
  };

  // Format area with commas (only numbers)
  const formatArea = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Extract only numbers from duration
  const parseDuration = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Extract only numbers from year
  const parseYear = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.length > 0 ? parseInt(num) : new Date().getFullYear();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'year') {
      setFormData((prev) => ({
        ...prev,
        year: parseYear(value),
      }));
    } else if (name === 'area') {
      const formatted = formatArea(value);
      setFormData((prev) => ({
        ...prev,
        area: formatted,
      }));
    } else if (name === 'duration') {
      const parsed = parseDuration(value);
      setFormData((prev) => ({
        ...prev,
        duration: parsed ? `${parsed} weeks` : '',
      }));
    } else if (name === 'slug') {
      const slugified = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      setFormData((prev) => ({
        ...prev,
        slug: slugified,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.slug ||
        !formData.location ||
        !formData.client_name ||
        !formData.testimonial ||
        !formData.description ||
        !formData.area ||
        !formData.duration ||
        formData.tags.length === 0
      ) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create project');
        setLoading(false);
        return;
      }

      setSuccess('Project created successfully!');
      // Reset form
      setFormData({
        title: '',
        slug: '',
        category: 'commercial',
        location: '',
        client_name: '',
        testimonial: '',
        description: '',
        year: new Date().getFullYear(),
        area: '',
        duration: '',
        featured: false,
        tags: [],
        cover_image: '',
      });
      setTagInput('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('[admin] submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-400 mb-6">Project Management Portal</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Add New Project</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
          >
            Logout
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              placeholder="e.g., Zara Flagship Mumbai"
              required
            />
          </div>

          {/* Slug (auto-generated) */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Project Slug * (auto-generated)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              placeholder="auto-generated from title"
            />
            <p className="text-slate-500 text-xs mt-1">
              URL-safe name (lowercase, hyphens)
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:border-amber-500 transition"
            >
              <option value="commercial">Commercial</option>
              <option value="retail">Retail</option>
              <option value="residential">Residential</option>
              <option value="civil">Civil</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              placeholder="e.g., Gurgaon, Haryana"
              required
            />
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Client Name *
            </label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              placeholder="e.g., Bata India LTD"
              required
            />
          </div>

          {/* Testimonial */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Client Testimonial * (1-2 sentences)
            </label>
            <textarea
              name="testimonial"
              value={formData.testimonial}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
              placeholder="What did the client say..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Project Description * (2-3 sentences)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
              placeholder="What was built, key features..."
              required
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Completion Year *
            </label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              placeholder="2025"
              required
            />
            <p className="text-slate-500 text-xs mt-1">Numbers only</p>
          </div>

          {/* Area */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Area (sq ft) *
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              placeholder="10000"
              required
            />
            <p className="text-slate-500 text-xs mt-1">
              Numbers only (will format as 10,000)
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Duration (weeks) *
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration.replace(' weeks', '')}
              onChange={(e) =>
                handleChange({
                  ...e,
                  target: { ...e.target, name: 'duration', value: e.target.value }
                } as any)
              }
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              placeholder="25"
              required
            />
            <p className="text-slate-500 text-xs mt-1">
              Numbers only (will save as &quot;25 weeks&quot;)
            </p>
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-slate-700/50 border border-slate-600 accent-amber-600 cursor-pointer"
            />
            <label className="text-slate-300 text-sm font-medium cursor-pointer">
              Featured on homepage carousel
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Tags * (3-5 skills/services)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                placeholder="Type and press Enter or click Add"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition font-medium"
              >
                Add
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-amber-600/20 border border-amber-500/50 text-amber-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-amber-100 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Cover Image URL (optional)
            </label>
            <input
              type="text"
              name="cover_image"
              value={formData.cover_image || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              placeholder="/images/projects/your-slug/cover.jpg"
            />
            <p className="text-slate-500 text-xs mt-1">
              Path to cover image in public folder. e.g., /images/projects/project-slug/cover.jpg
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded p-4 text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded p-4 text-green-200">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
