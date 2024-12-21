import React from "react";
import { Button } from "../ui/button";

interface NavbarProps {
  walletId: string;
  connectAccount: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ walletId, connectAccount }) => {
  return (
    <div className="flex justify-between items-center fixed top-1 left-1 right-0 w-full p-4 bg-slate-200/40 backdrop-blur-md rounded-lg text-white shadow-lg z-50">
      {/* Left side: Dappazon Title */}
      <div className="text-3xl font-bold text-slate-600 font-sans tracking-wide">
        Dappazon
      </div>

      {/* Right side: Display walletId in the button */}
      <Button onClick={connectAccount}>
        {walletId
          ? `Wallet: ${walletId.slice(0, 6)}...${walletId.slice(-4)}`
          : "Connect Wallet"}
      </Button>
    </div>
  );
};

export default Navbar;
