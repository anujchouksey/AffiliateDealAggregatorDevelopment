import React from 'react';
import { X, ShieldCheck, FileText, Scale, Mail, CheckCircle2 } from 'lucide-react';

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
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col p-6 md:p-8 shadow-2xl relative text-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' && <ShieldCheck className="w-5 h-5 text-indigo-400" />}
            {type === 'terms' && <Scale className="w-5 h-5 text-amber-400" />}
            {type === 'ftc' && <FileText className="w-5 h-5 text-emerald-400" />}
            {type === 'contact' && <Mail className="w-5 h-5 text-orange-400" />}
            <h2 className="text-base md:text-lg font-bold text-slate-100">
              {type === 'privacy' && 'Privacy Policy & Data Protection'}
              {type === 'terms' && 'Terms of Service & User Agreement'}
              {type === 'ftc' && 'FTC Affiliate Disclosure & Partner Transparency'}
              {type === 'contact' && 'Contact Support & Partnership Desk'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto pr-2 space-y-4 text-xs text-slate-300 leading-relaxed">
          {type === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-2xl text-[11px] text-indigo-300">
                <strong>Google AdSense, GDPR & CCPA Compliance Verified:</strong> Last updated October 2026.
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">1. Information We Collect</h4>
                <p>
                  DealPulse operates on a privacy-first model. We do not require account registration or store credit card data. We collect anonymous aggregate usage statistics, IP addresses for geolocation-based deal sorting, and email addresses solely when users voluntarily opt into Price Drop Alerts or Newsletters.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">2. Cookies & Advertising Beacons</h4>
                <p>
                  Third-party ad networks including Google AdSense, Ezoic, and affiliate networks (such as Amazon Associates, Walmart Affiliate Network, and Impact) may use cookies, web beacons, or tracking pixels to serve relevant ads based on prior visits and ensure proper attribution of affiliate commissions.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">3. Your Privacy Rights (GDPR & CCPA)</h4>
                <p>
                  Users may request deletion of any stored alert emails at any time. We do not sell, rent, or trade personal data to third parties.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">4. Contact Data Controller</h4>
                <p>
                  For data requests or privacy questions, contact <span className="font-mono text-indigo-400">privacy@fidlogicitsolutions.com</span>.
                </p>
              </div>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-2xl text-[11px] text-amber-300">
                <strong>User Terms & Commercial Disclaimers:</strong> By using DealPulse, you agree to these terms.
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">1. Deal Accuracy & Pricing Volatility</h4>
                <p>
                  DealPulse aggregates discounts from third-party retailers. Prices, coupons, promo codes, and inventory levels fluctuate rapidly. While our automation verifies discounts hourly, DealPulse cannot guarantee the availability or exact price at the moment of merchant checkout.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">2. Third-Party Transactions</h4>
                <p>
                  All purchases are executed directly on the merchant's secure platform (e.g. Amazon, Walmart, Chase, Best Buy). DealPulse does not process payments or handle fulfillment, returns, or warranties.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">3. Intellectual Property</h4>
                <p>
                  All software code, layout designs, and algorithms are proprietary property of FidlogicItsolutions. Merchant logos and trademarks remain the property of their respective owners.
                </p>
              </div>
            </div>
          )}

          {type === 'ftc' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl text-[11px] text-emerald-300">
                <strong>Mandatory FTC Statement (16 CFR § 255.5 & Amazon Associates Operating Agreement Compliance):</strong>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">Amazon Associates Program Disclosure</h4>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200">
                  "DealPulse is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com."
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">General Affiliate & Financial Partner Relationships</h4>
                <p>
                  DealPulse maintains commercial affiliate relationships with retailers, credit card issuers, and software companies. When you click on product links or credit card offers and complete a purchase or application, DealPulse may receive a commission at <strong>no additional cost to you</strong>.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">Editorial Independence</h4>
                <p>
                  Affiliate compensation does not influence our objective deal curation, discount calculations, or community upvote scores. Only deals meeting our strict minimum threshold criteria are approved for publication.
                </p>
              </div>
            </div>
          )}

          {type === 'contact' && (
            <div>
              {contactSent ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 text-center text-emerald-300">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                  <h3 className="font-bold text-sm">Message Sent Successfully!</h3>
                  <p className="text-xs text-slate-400 mt-1">Our support team will respond within 24 business hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <p className="text-xs text-slate-400 mb-2">
                    Have a question, feedback, partnership request, or deal correction? Send us a message directly.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Alex Morgan"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Email</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="alex@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Inquiry Type</label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                    >
                      <option value="General Inquiry">General Inquiry / User Feedback</option>
                      <option value="Deal Suggestion">Suggest a Brand or Deal</option>
                      <option value="Affiliate / Brand Partnership">Affiliate / Brand Partnership</option>
                      <option value="Acquisition / Buy Website">Acquisition / Business Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Official Trust & Transparency Protocol • FidlogicItsolutions</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 font-semibold"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
