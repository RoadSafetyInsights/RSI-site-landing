# GDPR & Cookie Compliance Guidelines

## 1. Overview
As **RoadSafetyInsights (RSI)** collects user data (such as emails and business contact information via forms) and utilizes local storage mechanisms for preference management, compliance with the General Data Protection Regulation (GDPR) is mandatory.

## 2. Cookie Consent & Local Storage
* **User Consent:** A clear cookie banner must be displayed to first-time visitors, informing them about the usage of cookies and local storage state management.
* **LocalStorage Tracking:** The application utilizes browser `localStorage` solely to save the user's explicit consent choice, ensuring the banner does not repeatedly obstruct navigation upon return visits.
* **Opt-Out Mechanism:** Users must have the explicit ability to decline or modify their consent preferences at any time.

## 3. Data Collection & Netlify Forms
* **Form Submissions:** Data submitted through driver early-access signups or business demo forms is routed securely via Netlify infrastructure.
* **Honeypot Protection:** An invisible honeypot field (`bot-field`) is integrated into form structures to intercept automated spam submissions without unlawfully tracking unnecessary personal metrics.
* **Minimal Data Principle:** Only strictly necessary data (such as email addresses, names, and organization types) is gathered for its intended purpose—such as notifying users about platform launches or scheduling software demonstrations.

## 4. User Rights (Data Subject Rights)
Under GDPR, users maintain full control over their personal data, including:
* **Right to Access:** Users can request a copy of all personal information currently stored by RSI.
* **Right to Rectification:** Users can ask to correct inaccurate or outdated contact information.
* **Right to Erasure ("Right to be Forgotten"):** Users can request the complete deletion of their data from our databases and form logs.
* **Revocation of Consent:** Users can withdraw their data processing or cookie consent at any moment by contacting our team directly at `info@roadsafetyinsights.com`.
