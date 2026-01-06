export default function Privacy() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 5, 2026</p>
        
        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
            <p>The Operator ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <p>We collect the following information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Email address (for authentication)</li>
              <li>Tasks, goals, and planning data you create within the app</li>
              <li>Usage data and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide and maintain the app functionality</li>
              <li>Authenticate your account</li>
              <li>Store and sync your planning data</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Storage</h2>
            <p>Your data is securely stored using Supabase, a trusted third-party service provider. We implement industry-standard security measures to protect your information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. Your data is only used to provide you with the app's services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2">Email: privacy@theoperator.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}
