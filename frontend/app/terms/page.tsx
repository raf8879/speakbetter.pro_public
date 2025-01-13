"use client";

import React from "react";

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4 text-gray-700 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500">
        (Last updated: January 10, 2025)
      </p>

      <section>
        <h2 className="text-xl font-semibold mb-1">1. Introduction</h2>
        <p>
          Welcome to the ESL Platform (the &quot;Service&quot;). This Service is provided by a private individual (not a registered LLC or corporation at this time) as a project to demonstrate an online English-learning solution. By accessing or using the Service, you agree to be bound by these Terms of Service (the &quot;Terms&quot;).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">2. Use of the Service</h2>
        <p>
          <strong>2.1 Eligibility:</strong> You must be at least 13 years old (or other age required by your local law) to use this Service.  
        </p>
        <p>
          <strong>2.2 Personal Account:</strong> During registration, we only require a username and an email. Additional profile details (first/last name) can be provided later in your account settings.
        </p>
        <p>
          <strong>2.3 Educational Purpose:</strong> The Service is provided for English language practice. We do not guarantee any specific learning outcomes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">3. User Conduct</h2>
        <p>
          You agree not to misuse the Service or engage in any unlawful activity. You are responsible for content you create (text, audio, etc.) and must ensure it does not violate any laws or the rights of others.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">4. Intellectual Property</h2>
        <p>
          All AI-generated content, exercises, or designs in the Service are for demonstration. The Service does not claim to provide professional or error-free content. 
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">5. Disclaimer &amp; Liability</h2>
        <p>
          The Service is provided &quot;AS IS&quot; without warranties of any kind. We (the project owner) are not liable for any direct or indirect damages arising from your use of the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">6. Changes to the Terms</h2>
        <p>
          We may modify these Terms at any time. Any changes will be posted on this page. Your continued use of the Service after changes have been posted will constitute your acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">7. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please visit our <a href="/contact" className="underline">Contact page</a>.
        </p>
      </section>
    </main>
  );
}
