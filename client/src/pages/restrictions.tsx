import { useState, useEffect } from "react";

export default function Restrictions() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isJudgeUser, setIsJudgeUser] = useState(false);

  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('billboardwalker_auth');
    const savedUser = localStorage.getItem('billboardwalker_user');
    
    if (authStatus === 'true' && savedUser) {
      setIsSignedIn(true);
      setCurrentUser(savedUser);
      setIsJudgeUser(savedUser === 'judge');
    }
  }, []);

  const handleSignOut = () => {
    setIsSignedIn(false);
    setCurrentUser('');
    setIsJudgeUser(false);
    localStorage.removeItem('billboardwalker_auth');
    localStorage.removeItem('billboardwalker_user');
    localStorage.removeItem('billboardwalker_userId');
    window.location.href = '/';
  };

  return (
    <div className="vibrant-bg min-h-screen text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-4">
                <img 
                  src="https://via.placeholder.com/80x80/ff6b6b/ffffff?text=IB"
                  alt="IamBillBoard Logo" 
                  className="w-20 h-20 object-contain filter drop-shadow-lg"
                />
                <div className="flex flex-col">
                  <div className="text-3xl font-black bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent tracking-wider leading-tight" style={{fontFamily: 'Playfair Display, serif'}}>
                    IamBillboard
                  </div>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-black transition-colors font-semibold">Home</a>
              <a href="/designs" className="text-gray-600 hover:text-black transition-colors font-semibold">Designs</a>
              <a href="/restrictions" className="text-black hover:text-red-500 transition-colors font-semibold">Restrictions</a>
              <a href="#about" className="text-gray-600 hover:text-black transition-colors font-semibold">About</a>
              <a href="#contact" className="text-gray-600 hover:text-black transition-colors font-semibold">Contact</a>
              
              {isSignedIn && (
                <a href="/dashboard" className="text-gray-600 hover:text-black transition-colors font-semibold">Dashboard</a>
              )}
              {isJudgeUser && (
                <a href="/admin" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
                  🛠️ Admin Panel
                </a>
              )}
              
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {currentUser}!</span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => window.location.href = '/signin'}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-black hover:text-red-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              
              {/* Mobile Menu Dropdown */}
              {showMobileMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-48 z-50">
                  <a href="/" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Home</a>
                  <a href="/designs" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Designs</a>
                  <a href="/restrictions" className="block px-4 py-2 text-black hover:text-red-500 font-semibold">Restrictions</a>
                  <a href="#about" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">About</a>
                  <a href="#contact" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Contact</a>
                  {isSignedIn && (
                    <a href="/dashboard" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Dashboard</a>
                  )}
                  {isJudgeUser && (
                    <a href="/admin" className="block px-4 py-2 text-purple-600 hover:text-purple-800 font-bold">🛠️ Admin Panel</a>
                  )}
                  
                  {isSignedIn ? (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Welcome, {currentUser}!</p>
                      <button
                        onClick={handleSignOut}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium w-full"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-gray-200">
                      <button
                        onClick={() => window.location.href = '/signin'}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-full font-bold w-full"
                      >
                        Get Started
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-6">
                <span className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Advertisement Restrictions
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Please follow these guidelines when advertising with IamBillBoard
              </p>
            </div>

            {/* Restrictions Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="space-y-8">
                
                {/* General Guidelines */}
                <div className="border-l-4 border-red-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    🚫 Prohibited Content
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 font-bold">❌</span>
                      <p className="text-gray-700">
                        <strong>Nudity or Sexual Content:</strong> Any nude, semi-nude or sexual content will not be approved
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 font-bold">❌</span>
                      <p className="text-gray-700">
                        <strong>Vulgar Language:</strong> Offensive words, profanity or inappropriate language is prohibited
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 font-bold">❌</span>
                      <p className="text-gray-700">
                        <strong>Hate Speech:</strong> Content against any religion, caste, gender or community is not allowed
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 font-bold">❌</span>
                      <p className="text-gray-700">
                        <strong>Violence & Weapons:</strong> Content depicting violence, weapons or threats is prohibited
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 font-bold">❌</span>
                      <p className="text-gray-700">
                        <strong>Illegal Activities:</strong> Promotion of drugs, gambling or illegal services is not permitted
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Guidelines */}
                <div className="border-l-4 border-green-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    ✅ Approved Content
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500 font-bold">✓</span>
                      <p className="text-gray-700">
                        <strong>Business Promotion:</strong> Clean promotion of your business, products or services
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500 font-bold">✓</span>
                      <p className="text-gray-700">
                        <strong>Brand Logos:</strong> Company logos, brand names and contact information
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500 font-bold">✓</span>
                      <p className="text-gray-700">
                        <strong>Educational Content:</strong> Knowledge, skills and awareness related content
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500 font-bold">✓</span>
                      <p className="text-gray-700">
                        <strong>Creative Designs:</strong> Artistic, creative and attractive designs
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500 font-bold">✓</span>
                      <p className="text-gray-700">
                        <strong>Social Messages:</strong> Positive social messages and awareness campaigns
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review Process */}
                <div className="border-l-4 border-blue-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    🔍 Review Process
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 font-bold">1.</span>
                      <p className="text-gray-700">
                        <strong>Submit Design:</strong> Upload your design when creating a campaign
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 font-bold">2.</span>
                      <p className="text-gray-700">
                        <strong>Admin Review:</strong> Our team reviews your design within 24-48 hours
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 font-bold">3.</span>
                      <p className="text-gray-700">
                        <strong>Approval/Rejection:</strong> Designs are approved if guidelines are followed, otherwise rejected with reason
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 font-bold">4.</span>
                      <p className="text-gray-700">
                        <strong>Production:</strong> Approved designs are printed and delivered within 7-10 days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consequences */}
                <div className="border-l-4 border-yellow-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    ⚠️ Violation Consequences
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-yellow-500 font-bold">⚠️</span>
                      <p className="text-gray-700">
                        <strong>First Warning:</strong> Initial rule violation will result in a warning
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-yellow-500 font-bold">⚠️</span>
                      <p className="text-gray-700">
                        <strong>Campaign Rejection:</strong> Campaigns with inappropriate content will be rejected
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 font-bold">🚫</span>
                      <p className="text-gray-700">
                        <strong>Account Suspension:</strong> Repeated violations may result in temporary account suspension
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 font-bold">🚫</span>
                      <p className="text-gray-700">
                        <strong>Permanent Ban:</strong> Serious violations may result in permanent account ban
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final Note */}
                <div className="text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
                  <p className="text-lg font-semibold text-gray-800">
                    IamBillBoard aims to provide a clean and professional advertising platform for everyone. 
                    <br />
                    <span className="text-red-600">Let's build a better advertising community together! 🚀</span>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <img 
                src="https://via.placeholder.com/60x60/ff6b6b/ffffff?text=IB"
                alt="IamBillBoard Logo" 
                className="w-15 h-15 object-contain"
              />
              <div className="text-2xl font-black bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                IamBillboard
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-400 mb-6">
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/restrictions" className="hover:text-white transition-colors text-white">Restrictions</a>
              {isSignedIn && (
                <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              )}
              {isJudgeUser && (
                <a href="/admin" className="hover:text-white transition-colors">Admin Panel</a>
              )}
            </div>
            
            <p className="text-gray-400 text-sm">
              © 2025 IamBillBoard. All rights reserved. Transform bottles into billboards!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}