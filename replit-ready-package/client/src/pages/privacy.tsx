export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Personal information: Name, email, phone number, address</li>
                <li>Business information: Company name, business requirements</li>
                <li>Design files and brand materials uploaded by customers</li>
                <li>Payment information (processed securely through payment gateways)</li>
                <li>Website usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Processing and fulfilling your bottle advertising orders</li>
                <li>Communicating order status and updates</li>
                <li>Providing customer support and assistance</li>
                <li>Improving our services and website functionality</li>
                <li>Sending promotional offers (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or share your personal information with third parties except:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>With our manufacturing partners to fulfill orders</li>
                <li>With payment processors for transaction processing</li>
                <li>With delivery partners for order shipment</li>
                <li>When required by law or legal processes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing through certified gateways</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your browsing experience, 
                analyze website traffic, and personalize content. You can control cookie settings 
                in your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your personal information we have stored</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability for your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              <p>
                We retain your information only as long as necessary for business purposes and legal requirements. 
                Order information is kept for 7 years for accounting and warranty purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Us</h2>
              <p>
                For privacy-related questions or to exercise your rights:
                <br />Email: privacy@billboardwalker.com
                <br />Phone: +91-9876543210
                <br />Address: Level Up Water, Industrial Area, India
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Policy Updates</h2>
              <p>
                This privacy policy may be updated periodically. We will notify you of significant changes 
                via email or website notification. Last updated: January 2025.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => window.history.back()} 
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Back to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}