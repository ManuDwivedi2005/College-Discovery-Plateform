import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">College Discovery</h3>
            <p className="text-sm text-slate-600">
              The premier platform for discovering, comparing, and deciding on the best colleges for your future.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/colleges" className="text-sm text-slate-600 hover:text-amber-600">Browse Colleges</Link></li>
              <li><Link href="/compare" className="text-sm text-slate-600 hover:text-amber-600">Compare</Link></li>
              <li><Link href="/predictor" className="text-sm text-slate-600 hover:text-amber-600">Predictor Tool</Link></li>
              <li><Link href="/qa" className="text-sm text-slate-600 hover:text-amber-600">Discussion Q&A</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">For Institutions</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/register-college" className="text-sm text-slate-600 hover:text-amber-600">Register a College</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 hover:text-amber-600">Partner with Us</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 hover:text-amber-600">Advertising</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-slate-600 hover:text-amber-600">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 hover:text-amber-600">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-slate-600 hover:text-amber-600">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} College Discovery. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6 sm:mt-0">
            <span className="text-sm text-slate-500">Contact: support@collegediscovery.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
