import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/ui/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Loadin from "./components/ui/loadin";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Players = lazy(() => import("./pages/Players"));
const PlayerDetails = lazy(() => import("./components/player/PlayerDetails"));
const AuctionSection = lazy(() => import("./components/auction/AuctionSection"));
const AdminAuctionControl = lazy(() =>
  import("./components/auction/AdminAuctionControl")
);
const UpdateTournament = lazy(() =>
  import("./components/Tournament/UpdateTournament")
);
const TournamentStats = lazy(() =>
  import("./components/Tournament/TournamentStats")
);
const PlayerTableAssign = lazy(() =>
  import("./components/Squads/PlayerTableAssign")
);
const DisplaySquad = lazy(() => import("./components/Squads/DisplaySquad"));
const SquadBuilder = lazy(() => import("./components/Squads/SquadBuilder"));
const About = lazy(() => import("./pages/About"));

const withRole = (role, Element) => (
  <ProtectedRoute role={role}>
    <Element />
  </ProtectedRoute>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden min-h-screen bg-fifa-bg text-fifa-text">
            <div className="md:h-full">
              <Navbar></Navbar>
            </div>
            <div className="flex-1 relative min-h-screen md:min-h-0 md:h-full overflow-y-auto">
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-fifa-bg">
                    <Loadin>Loading...</Loadin>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  <Route path="/user" element={withRole(["user"], UserDashboard)} />
                  <Route
                    path="/admin"
                    element={withRole(["admin"], AdminDashboard)}
                  />
                  <Route
                    path="/players"
                    element={withRole(["admin", "user"], Players)}
                  />
                  <Route
                    path="/squadupdate"
                    element={withRole(["user", "admin"], PlayerTableAssign)}
                  />
                  <Route
                    path="/admin/auction"
                    element={withRole(["admin"], AdminAuctionControl)}
                  />
                  <Route
                    path="/admin/updatetournament"
                    element={withRole(["admin"], UpdateTournament)}
                  />
                  <Route
                    path="/player-details"
                    element={withRole(["user", "admin"], PlayerDetails)}
                  />
                  <Route path="/auction" element={<AuctionSection />} />

                  <Route
                    path="/tournamentstats"
                    element={withRole(["user", "admin"], TournamentStats)}
                  />
                  <Route
                    path="/user/squad"
                    element={withRole(["user", "admin"], DisplaySquad)}
                  />
                  <Route
                    path="/user/buildsquad"
                    element={withRole(["user", "admin"], SquadBuilder)}
                  />
                  <Route path="/about" element={<About />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;
