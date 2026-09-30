"use client";
import { Link } from "react-router-dom";
import { Link2, Wallet, AlertTriangle } from "lucide-react";
import { useWallet } from "@/lib/genlayer/wallet";
import { shortAddress } from "@/lib/format";

export default function AppHeader(){
  const w=useWallet();
  return <header className="app-header">
    <Link className="brand" to="/" aria-label="ProofReferral home">
      <span className="brand-mark"><Link2 size={17}/></span><span>ProofReferral</span>
    </Link>
    <nav className="nav-links"><Link to="/opportunities">Opportunities</Link><Link to="/dashboard">Dashboard</Link><Link to="/protocol">Protocol</Link><Link to="/docs">Docs</Link><Link to="/developers">Developers</Link><Link to="/opportunities/new">Create</Link></nav>
    <div className="wallet-zone">
      <span className={`network-chip ${w.correctNetwork?'ok':'warn'}`}>
        {w.connected && !w.correctNetwork ? <AlertTriangle size={13}/> : <span className="pulse-dot"/>}
        {w.connected && !w.correctNetwork ? `Wrong network${w.chainId?` · ${w.chainId}`:''}` : 'Studio Next · 61997'}
      </span>
      {!w.connected ? <button className="button primary small" disabled={w.busy} onClick={()=>void w.connect()}><Wallet size={15}/>{w.busy?'Connecting…':'Connect wallet'}</button>
      : !w.correctNetwork ? <button className="button danger small" disabled={w.busy} onClick={()=>void w.switchNetwork()}>Switch to 61997</button>
      : <><span className="address-pill">{shortAddress(w.address)}</span><button className="button secondary small" onClick={()=>void w.disconnect()}>Disconnect</button></>}
    </div>
    {w.error && <div className="wallet-error">{w.error}</div>}
  </header>
}
