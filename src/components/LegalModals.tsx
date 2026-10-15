import React from 'react';
import { X, ShieldCheck, FileText, Scale, Mail, CheckCircle2, Lock, HardDrive, ExternalLink } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'ftc' | 'contact' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const [contactSent, setContactSent] = React.useState(false);
  const [contactForm, setContactForm] = React.useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

  if (!type) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open native mailto with the user's message pre-filled
    const mailtoUrl = `mailto:contact@fidlogic.com?subject=${encodeURIComponent(`[DealPulse] ${contactForm.subject} - from ${contactForm.name}`)}&body=${encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\nInquiry: ${contactForm.subject}\n\nMessage:\n${contactForm.message}`)}`;
    window.location.href = mailtoUrl;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#161618] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col p-6 md:p-8 shadow-2xl relative text-[#f5f5f7] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' && <ShieldCheck className="w-5 h-5 text-[#30d158]" />}
            {type === 'terms' && <Scale className="w-5 h-5 text-[#f5a623]" />}
            {type === 'ftc' && <FileText className="w-5 h-5 text-[#0071e3]" />}
            {type === 'contact' && <Mail className="w-5 h-5 text-[#bf5af2]" />}
            <h2 className="text-base md:text-lg font-semibold text-[#f5f5f7] tracking-tight">
              {type === 'privacy' && 'Privacy Policy & Data Transparency'}
              {type === 'terms' && 'Terms of Service & User Agreement'}
              {type === 'ftc' && 'FTC Affiliate Disclosure & Partner Transparency'}
              {type === 'contact' && 'Contact Support & Inquiries'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-[#86868b] hover:text-white p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto pr-2 space-y-4 text-xs text-[#86868b] leading-relaxed">
          {type === 'privacy' && (
            <div className="space-y-4">
              {/* Highlight Banner: Zero Server Data Storage */}
              <div className="bg-[#30d158]/10 border border-[#30d158]/25 p-3.5 rounded-2xl text-[12px] text-[#30d158] flex items-start gap-2.5">
                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Privacy-First Architecture: Zero Server-Side User Data Storage</strong>
                  DealPulse does not collect, track, or store personal user data on central servers. We operate with zero mandatory logins, zero user profiling, and zero data selling.
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#30d158]" />
                  1. Zero Personal Data Collection
                </h4>
                <p>
                  We believe true privacy means not collecting data in the first place. DealPulse does not require user account registration, and we never collect, store, or solicit names, passwords, phone numbers, home addresses, or credit card details on our backend servers.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-[#0071e3]" />
                  2. Client-Side Browser Storage Only (localStorage)
                </h4>
                <p>
                  Any features you interact with locally—such as bookmarked deals, upvote tallies, or theme preferences—are saved exclusively within your own device's browser <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono text-[11px]">localStorage</code>. This data never leaves your device, is never transmitted to our servers, and can be cleared instantly by you at any time via your browser settings.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-[#f5a623]" />
                  3. Outbound Retailer Transactions
                </h4>
                <p>
                  When you click a verified deal, you are redirected directly to the retailer's official website (e.g., Amazon, Walmart, Best Buy). All transactions, payment processing, shipping, and order fulfillments occur strictly on the merchant's secure platform under their respective privacy policies. DealPulse never processes or views your financial transactions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1">4. Affiliate Referral Cookies</h4>
                <p>
                  DealPulse participates in verified affiliate marketing programs. When you click an outbound product link, third-party merchant networks may set standard referral cookies solely to attribute qualifying purchases. These cookies do not capture your personal identity and operate under the respective retailer's cookie policy.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1">5. Contact & Privacy Inquiries</h4>
                <p>
                  For any privacy questions, feedback, or verification requests, contact our dedicated team at{' '}
                  <a
                    href="mailto:contact@fidlogic.com"
                    className="text-[#2997ff] font-medium hover:underline inline-flex items-center gap-1"
                  >
                    contact@fidlogic.com
                  </a>.
                </p>
              </div>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-4">
              <div className="bg-[#f5a623]/10 border border-[#f5a623]/25 p-3.5 rounded-2xl text-[12px] text-[#f5a623]">
                <strong className="text-white block font-semibold mb-0.5">User Terms & Commercial Disclaimers</strong>
                By browsing DealPulse, you acknowledge and agree to the terms described below.
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1">1. Deal Accuracy & Pricing Volatility</h4>
                <p>
                  DealPulse aggregates price drops, promotions, and discounts from third-party retailers. Merchant prices, inventory availability, promo codes, and shipping fees can change rapidly without notice. While we verify deals regularly, DealPulse cannot guarantee the final price or inventory at checkout on the retailer's website.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1">2. Merchant Fulfillment & Third-Party Orders</h4>
                <p>
                  All purchases are executed directly on merchant websites (such as Amazon, Walmart, Best Buy). DealPulse is not a retailer or seller of record. DealPulse is not responsible for order fulfillment, product quality, delivery, refunds, or customer support for items purchased through outbound links.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1">3. Intellectual Property</h4>
                <p>
                  All software code, user interface designs, and proprietary aggregation algorithms are the intellectual property of <strong className="text-white">FidlogicItsolutions</strong>. All product names, logos, and brands are property of their respective owners.
                </p>
              </div>
            </div>
          )}

          {type === 'ftc' && (
            <div className="space-y-4">
              <div className="bg-[#0071e3]/10 border border-[#0071e3]/25 p-3.5 rounded-2xl text-[12px] text-[#2997ff]">
                <strong className="text-white block font-semibold mb-0.5">Mandatory FTC & Affiliate Transparency Disclosure</strong>
                Compliant with 16 CFR § 255.5 and the Amazon Associates Operating Agreement.
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1">Amazon Associates Program Disclosure</h4>
                <div className="bg-black/40 p-3 rounded-xl border border-white/[0.08] text-[12px] text-white">
                  &ldquo;DealPulse is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.&rdquo;
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1">General Affiliate Partnerships</h4>
                <p>
                  DealPulse maintains commercial affiliate relationships with leading online retailers. When you click on product links and complete a purchase, DealPulse may receive a referral commission from the retailer at <strong className="text-white">zero additional cost to you</strong>.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f5f5f7] text-[13px] mb-1">Editorial Independence</h4>
                <p>
                  Our deal selection, price comparison calculations, and community votes are curated objectively. We prioritize verified value, genuine price drops, and historical all-time lows over commission margins.
                </p>
              </div>
            </div>
          )}

          {type === 'contact' && (
            <div className="space-y-4">
              {/* Direct Email Card */}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#2997ff] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#86868b] font-medium block">Official Contact Email</span>
                    <a
                      href="mailto:contact@fidlogic.com"
                      className="text-sm font-semibold text-white hover:text-[#2997ff] transition-colors"
                    >
                      contact@fidlogic.com
                    </a>
                  </div>
                </div>

                <a
                  href="mailto:contact@fidlogic.com"
                  className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-medium transition-all shadow-sm"
                >
                  Compose Email &rarr;
                </a>
              </div>

              {contactSent ? (
                <div className="bg-[#30d158]/10 border border-[#30d158]/30 rounded-2xl p-6 text-center text-[#30d158]">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-[#30d158]" />
                  <h3 className="font-bold text-sm text-white">Opening Email Client...</h3>
                  <p className="text-xs text-[#86868b] mt-1">
                    Your message has been transferred to contact@fidlogic.com. We respond within 24 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3 pt-1">
                  <p className="text-xs text-[#86868b]">
                    Have a question, feedback, partnership request, or deal suggestion? Submit details below:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#86868b] mb-1">Your Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Alex Morgan"
                        className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#0071e3] transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#86868b] mb-1">Your Email</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="alex@example.com"
                        className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#0071e3] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868b] mb-1">Inquiry Type</label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#0071e3] transition-colors"
                    >
                      <option value="General Inquiry" className="bg-[#1c1c1e] text-white">General Inquiry / User Feedback</option>
                      <option value="Deal Suggestion" className="bg-[#1c1c1e] text-white">Suggest a Brand or Deal</option>
                      <option value="Affiliate / Brand Partnership" className="bg-[#1c1c1e] text-white">Affiliate / Brand Partnership</option>
                      <option value="Business Inquiry" className="bg-[#1c1c1e] text-white">Business & Acquisition Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#86868b] mb-1">Message</label>
                    <textarea
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none focus:border-[#0071e3] transition-colors resize-none"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-full text-xs transition-all shadow-sm"
                    >
                      Send to contact@fidlogic.com
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#86868b] shrink-0">
          <span>Official Trust & Transparency Protocol • FidlogicItsolutions</span>
          <button
            onClick={onClose}
            className="text-white hover:text-[#2997ff] font-medium transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
