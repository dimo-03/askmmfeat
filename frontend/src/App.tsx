import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { DonateModalProvider } from '@/context/DonateModalContext';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Leadership from '@/pages/Leadership';
import Initiatives from '@/pages/Initiatives';
import InitiativeDetail from '@/pages/InitiativeDetail';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import Gallery from '@/pages/Gallery';
import Impact from '@/pages/Impact';
import GetInvolved from '@/pages/GetInvolved';
import Donate from '@/pages/Donate';
import Contact from '@/pages/Contact';
import Membership from '@/pages/Membership';
import LegalPage from '@/pages/LegalPage';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import MemberLogin from '@/pages/MemberLogin';
import MemberNotifications from '@/pages/MemberNotifications';

function App() {
  return (
    <BrowserRouter>
      <DonateModalProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="leadership" element={<Leadership />} />
            <Route path="initiatives" element={<Initiatives />} />
            <Route path="initiatives/:slug" element={<InitiativeDetail />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:slug" element={<EventDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="impact" element={<Impact />} />
            <Route path="get-involved" element={<GetInvolved />} />
            <Route path="donate" element={<Donate />} />
            <Route path="membership" element={<Membership />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<LegalPage kind="privacy" />} />
            <Route path="terms" element={<LegalPage kind="terms" />} />
            <Route path="member/login" element={<MemberLogin />} />
            <Route path="member/notifications" element={<MemberNotifications />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin" element={<Admin />} />
        </Routes>
      </DonateModalProvider>
    </BrowserRouter>
  );
}

export default App;
