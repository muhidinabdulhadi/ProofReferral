import { Route, Routes } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import Home from "@/Home";
import Dashboard from "@/Dashboard";
import Developers from "@/Developers";
import Docs from "@/Docs";
import Judgment from "@/Judgment";
import NewOpportunity from "@/NewOpportunity";
import Opportunities from "@/Opportunities";
import OpportunityDetail from "@/OpportunityDetail";
import Protocol from "@/Protocol";
import Transaction from "@/Transaction";

export default function App() {
  return (
    <>
      <div className="top-rule" />
      <AppHeader />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/judgments/:id/:attempt" element={<Judgment />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/new" element={<NewOpportunity />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/protocol" element={<Protocol />} />
          <Route path="/transactions/:hash" element={<Transaction />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>ProofReferral</span>
        <span>Future of Work · GenLayer Studio Next · 61997</span>
        <span>Referral attribution → verified work → split payment</span>
      </footer>
    </>
  );
}