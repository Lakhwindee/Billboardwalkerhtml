# 🎨 CSS Styles Reference - Exact Implementation

## 🎯 Copy-Paste CSS Classes (Tailwind)

### Homepage Hero Section
```html
<div className="bg-gradient-to-r from-purple-900 via-purple-800 to-gray-900 text-white min-h-screen">
  <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
    Custom Bottle Advertising Revolution
  </h1>
  <p className="text-xl md:text-2xl mb-8 text-center opacity-90">
    Transform your brand with premium custom bottle labels
  </p>
  <button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200">
    Start Creating Now
  </button>
</div>
```

### Stats Section
```html
<div className="bg-gray-900 py-16">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
    <div className="text-white">
      <div className="text-4xl font-bold text-pink-500 mb-2">50K+</div>
      <div className="text-xl">Orders Completed</div>
    </div>
    <div className="text-white">
      <div className="text-4xl font-bold text-pink-500 mb-2">500+</div>
      <div className="text-xl">Unique Designs</div>
    </div>
    <div className="text-white">
      <div className="text-4xl font-bold text-pink-500 mb-2">7 Days</div>
      <div className="text-xl">Fast Delivery</div>
    </div>
  </div>
</div>
```

### Bottle Cards
```html
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="bg-gray-800 border border-pink-500 rounded-lg p-6 hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200">
    <h3 className="text-xl font-bold text-white mb-4">1L Bottle</h3>
    <div className="text-2xl font-bold text-pink-500 mb-4">₹25/bottle</div>
    <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-md transition-colors">
      Select Size
    </button>
  </div>
</div>
```

### Admin Sidebar
```html
<div className="bg-gray-800 text-white w-64 min-h-screen p-4">
  <div className="mb-8">
    <h2 className="text-xl font-bold text-pink-400">Admin Panel</h2>
  </div>
  <nav className="space-y-2">
    <a className="flex items-center px-4 py-2 rounded-lg bg-pink-500 text-white">
      Dashboard
    </a>
    <a className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
      Campaigns
    </a>
  </nav>
</div>
```

### Form Inputs
```html
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Campaign Title
  </label>
  <input 
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
    placeholder="Enter campaign title"
  />
</div>
```

### Status Badges
```html
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Approved
</span>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  Pending
</span>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
  Rejected
</span>
```

### Data Tables
```html
<div className="overflow-x-auto">
  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Campaign
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          Campaign Name
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Loading Spinner
```html
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
</div>
```

### Modal/Dialog
```html
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg p-6 w-full max-w-md">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Action</h3>
    <div className="flex justify-end space-x-3">
      <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors">
        Cancel
      </button>
      <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md transition-colors">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Mobile Navigation
```html
<div className="md:hidden">
  <button className="text-white p-2">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
  </button>
</div>
```

### Upload Area
```html
<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-500 transition-colors">
  <div className="text-gray-500 mb-4">
    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
    </svg>
  </div>
  <p className="text-lg text-gray-600 mb-2">Drop your design here</p>
  <p className="text-sm text-gray-500">or click to browse files</p>
</div>
```

### Price Calculator Card
```html
<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Calculator</h3>
  <div className="space-y-4">
    <div className="flex justify-between">
      <span className="text-gray-600">Quantity:</span>
      <span className="font-medium">1000 bottles</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Price per bottle:</span>
      <span className="font-medium">₹25</span>
    </div>
    <hr className="border-gray-200">
    <div className="flex justify-between text-lg font-bold">
      <span>Total Amount:</span>
      <span className="text-pink-500">₹25,000</span>
    </div>
  </div>
</div>
```

## 🎨 Custom CSS Variables (index.css)
```css
:root {
  --primary-pink: #ec4899;
  --secondary-purple: #8b5cf6;
  --dark-bg: #1f2937;
  --light-gray: #f9fafb;
  --text-gray: #6b7280;
  --success-green: #10b981;
  --error-red: #ef4444;
  --warning-orange: #f59e0b;
}

.gradient-bg {
  background: linear-gradient(135deg, var(--secondary-purple), var(--primary-pink));
}

.dark-gradient {
  background: linear-gradient(135deg, #1f2937, #111827);
}
```

## 📱 Responsive Design Classes
```html
<!-- Mobile First Approach -->
<div className="px-4 md:px-6 lg:px-8">
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
<div className="mb-4 md:mb-6 lg:mb-8">
```

## ⚠️ CRITICAL: Use EXACT Classes
Copy these classes exactly - no modifications allowed. This ensures the exact same design.