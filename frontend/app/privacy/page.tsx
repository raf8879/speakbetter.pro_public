"use client";

import React from "react";

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4 text-gray-700 dark:text-gray-200">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500">
        (Last updated: January 10, 2025)
      </p>

      <section>
        <h2 className="text-xl font-semibold mb-1">1. Introduction</h2>
        <p>
          This Privacy Policy explains how we collect, use, and protect your information when you use our ESL Platform (&quot;Service&quot;). This project is run by an individual developer for demonstration purposes, not by a registered company.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">2. Information We Collect</h2>
        <p>
          <strong>2.1 Registration Data:</strong> We require only a username and email for creating an account. Optionally, you may provide first/last name in your profile.  
        </p>
        <p>
          <strong>2.2 Usage Data:</strong> We store your progress, XP points, achievements, and any text or audio you submit for the purpose of learning analytics.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">3. How We Use Your Data</h2>
        <p>
          <strong>3.1 Provide Services:</strong> We use your data to run English-learning features, such as exercises, AI chat, and pronunciation analysis.  
        </p>
        <p>
          <strong>3.2 Improvements:</strong> We may analyze usage to improve the platform (e.g., to refine AI responses or exercise difficulty).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">4. Data Sharing</h2>
        <p>
          We do not sell or share personal information with third parties for marketing. We may use third-party APIs (speech recognition, AI generation), but anonymize or limit personal data where possible.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">5. Data Security</h2>
        <p>
          We take reasonable measures to protect your data, but no method of transmission or storage is 100% secure. You acknowledge using this Service at your own risk.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">6. Retention and Deletion</h2>
        <p>
          You can request account deletion by contacting us. We will remove your data unless required by law or legitimate interests.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Updates will be posted on this page, and your continued use of the Service indicates your acceptance of any changes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">8. Contact Us</h2>
        <p>
          If you have questions or requests about your personal data, please visit our <a href="/contact" className="underline">Contact page</a>.
        </p>
      </section>
    </main>
  );
}
