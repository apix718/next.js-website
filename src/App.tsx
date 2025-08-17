import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MarketingAgencyWebsite from './components/marketing-agency-website';
import CaseStudyDetail from './components/CaseStudyDetail';
import CaseStudiesPage from './components/CaseStudiesPage';
import BlogPage from './components/BlogPage';
import BlogPostDetail from './components/BlogPostDetail';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="webtmize-theme">
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MarketingAgencyWebsite />} />
            <Route path="/case-studies" element={<CaseStudiesPage />} />
            <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostDetail />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;