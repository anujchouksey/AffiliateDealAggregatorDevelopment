import React, { useState, useEffect } from 'react';
import { 
  X, Smartphone, Share, PlusSquare, CheckCircle2, 
  Download, Apple, Play, Sparkles, BellRing, Copy, Check
} from 'lucide-react';
import { triggerDealPushNotification, requestNotificationPermission } from '../services/notificationService';
import type { Deal } from '../types';

interface InstallPwaModalProps {
  onClose: () => void;
  sampleDeal?: Deal;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ onClose, sampleDeal }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'stores'>('ios');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [testAlertSent, setTestAlertSent] = useState<boolean>(false);

  useEffect(() => {
    // Detect if already running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Capture Android beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setActiveTab('android');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleSendTestPush = async () => {
    await requestNotificationPermission();
    if (sampleDeal) {
      triggerDealPushNotification(sampleDeal);
    } else {
      triggerDealPushNotification({
        id: 'test-drop',
        title: 'Sony WH-1000XM5 Wireless Headphones (Save $120)',
        description: 'Industry-leading noise cancellation with auto NC optimizer.',
        dealPrice: 278.00,
        originalPrice: 399.99,
        discountPercentage: 30,
        store: 'Amazon',
        category: 'Electronics',
        imageUrl: '/images/sony_headphones.jpg',
        affiliateUrl: 'https://amazon.com',
        rawUrl: 'https://amazon.com/dp/B09XS7JWHH',
        upvotes: 480,
        downvotes: 1,
        postedAt: 'Just Now',
        viewsCount: 1500,
        commentsCount: 12
      });
    }
    setTestAlertSent(true);
    setTimeout(() => setTestAlertSent(false), 3500);
  };

  const capacitorCommands = `npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "DealPulse" "com.fidlogic.dealpulse" --web-dir "dist"
npm run build
npx cap add ios
npx cap add android
npx cap open ios     # Opens Xcode for App Store submission
npx cap open android # Opens Android Studio for Google Play`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(capacitorCommands);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors border border-slate-700"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
            <Smartphone className="w-6 h-6 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-slate-100">Cross-Platform App Experience</h2>
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${
                isInstalled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}>
                {isInstalled ? '● Installed (Standalone)' : 'PWA + Native'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Install directly to home screen on iOS & Android with zero app store download required
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-slate-800 text-orange-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / Safari</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'bg-slate-800 text-orange-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Android / Chrome</span>
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'stores'
                ? 'bg-slate-800 text-purple-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>App Store / Play</span>
          </button>
        </div>

        {/* Tab 1: iOS iPhone/iPad Instructions */}
        {activeTab === 'ios' && (
          <div className="space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-3">
                <Apple className="w-4 h-4 text-orange-400" />
                How it works on Apple iPhone & iPad:
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0 border border-orange-500/30 text-[11px]">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">Open in Safari</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Open DealPulse in Apple Safari browser, then tap the <strong className="text-slate-200">Share button</strong> (the square with an arrow pointing up <Share className="w-3.5 h-3.5 inline mx-0.5 text-sky-400" />) on the bottom toolbar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0 border border-orange-500/30 text-[11px]">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">Select "Add to Home Screen"</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Scroll down through the share actions and tap <strong className="text-slate-200">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-300" />).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0 border border-orange-500/30 text-[11px]">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">Tap "Add" & Enjoy Native Fullscreen</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      DealPulse installs directly onto your iPhone home screen. It launches in standalone fullscreen mode without Safari URL bars and receives Web Push alerts (supported in iOS 16.4+).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-emerald-300 block">Test Live Push Alert</span>
                <span className="text-[11px] text-emerald-400/80">See how deal notifications look on your device</span>
              </div>
              <button
                onClick={handleSendTestPush}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{testAlertSent ? 'Alert Dispatched!' : 'Send Test Alert'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Android Chrome Instructions */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-emerald-400" />
                How it works on Android (Chrome, Samsung Internet, Edge):
              </h3>

              {deferredPrompt ? (
                <div className="text-center py-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl mb-4 p-4">
                  <span className="text-xs text-emerald-300 font-bold block mb-1">Android 1-Tap Quick Install Available!</span>
                  <p className="text-[11px] text-slate-400 mb-3">Install DealPulse directly into your Android apps drawer.</p>
                  <button
                    onClick={handleInstallAndroid}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Install DealPulse App Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                      1
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">Open in Chrome / Browser</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Android Chrome automatically shows an <strong className="text-slate-200">"Install app"</strong> banner or menu prompt.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                      2
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">Tap Chrome Menu (⋮) &rarr; "Install app"</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Alternatively tap the 3 vertical dots at top right, then select <strong className="text-slate-200">"Install app"</strong> or <strong className="text-slate-200">"Add to Home screen"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">Native App Drawer Integration</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        DealPulse installs as a Trusted Web Activity (TWA) with app badge, background notifications, and offline caching via Service Worker.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-emerald-300 block">Test Live Push Alert</span>
                <span className="text-[11px] text-emerald-400/80">Experience real-time discount popups on Android</span>
              </div>
              <button
                onClick={handleSendTestPush}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{testAlertSent ? 'Alert Dispatched!' : 'Send Test Alert'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Capacitor Native Stores Packaging */}
        {activeTab === 'stores' && (
          <div className="space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Package for Apple App Store & Google Play Store:
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                This app is architected with modern standard web APIs. You can wrap it into native iOS (<code className="text-amber-400">.ipa</code>) and Android (<code className="text-emerald-400">.aab</code>) binaries using <strong>Capacitor</strong> without changing a single line of application code:
              </p>

              <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-purple-300 overflow-x-auto">
                <pre>{capacitorCommands}</pre>
                <button
                  onClick={handleCopyCommands}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] flex items-center gap-1 transition-colors border border-slate-700"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-slate-300" /> iOS App Store
                </span>
                <p className="text-[11px] text-slate-400">
                  Compiles into native Xcode project with Apple Sign-In and APNs push support.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-emerald-400" /> Google Play
                </span>
                <p className="text-[11px] text-slate-400">
                  Compiles into Android Studio project ready for Google Play Console submission.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PWA Manifest & Service Worker Active</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
