export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Service Agreement</h2>
              <p>
                By using Billboard Walker's custom bottle advertising services, you agree to these terms and conditions. 
                Our service provides branded water bottle advertising solutions across India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Order Process</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>All orders require admin approval before production</li>
                <li>Design files must be provided in high resolution (minimum 300 DPI)</li>
                <li>Production time: 5-7 business days after approval</li>
                <li>Delivery within 7-14 days depending on location</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Payment Terms</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Full payment required before production starts</li>
                <li>Accepted payment methods: UPI, Card, Bank Transfer</li>
                <li>Refunds available only for order cancellations before production</li>
                <li>No refunds after production has started</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Quality Standards</h2>
              <p>
                We guarantee high-quality printing and bottle standards. All bottles meet food-grade safety requirements 
                and use eco-friendly materials. Quality issues will be addressed with replacement orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
              <p>
                Customers are responsible for ensuring they have rights to use all logos, images, and content provided. 
                Billboard Walker is not liable for copyright infringement issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
              <p>
                Billboard Walker's liability is limited to the order value. We are not responsible for indirect damages 
                or business losses related to advertising campaigns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Information</h2>
              <p>
                For questions about these terms, contact us at:
                <br />Email: support@billboardwalker.com
                <br />Phone: +91-9876543210
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