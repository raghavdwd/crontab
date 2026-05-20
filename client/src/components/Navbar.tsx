import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Clock, User as UserIcon, LogOut, LayoutDashboard, PlusCircle, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f1f1f4] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl h-16 items-center justify-between px-6">
        {/* Logo / Brand Name */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <Clock className="h-5 w-5 text-black stroke-[1.5]" />
          <span className="font-sans font-medium tracking-tight text-black text-base">
            crontab<span className="font-light text-[#71717a]">.sh</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`text-sm font-light tracking-wide transition-colors hover:text-black ${
                  isActive("/dashboard") ? "text-black font-normal" : "text-[#71717a]"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/create-job" 
                className={`text-sm font-light tracking-wide transition-colors hover:text-black ${
                  isActive("/create-job") ? "text-black font-normal" : "text-[#71717a]"
                }`}
              >
                Create Job
              </Link>
              <Link 
                to="/profile" 
                className={`text-sm font-light tracking-wide transition-colors hover:text-black ${
                  isActive("/profile") ? "text-black font-normal" : "text-[#71717a]"
                }`}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <a href="#features" className="text-sm font-light tracking-wide text-[#71717a] hover:text-black transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm font-light tracking-wide text-[#71717a] hover:text-black transition-colors">
                System
              </a>
            </>
          )}
        </nav>

        {/* Right side CTA or User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 outline-none focus:ring-0 focus:outline-none">
                  <Avatar className="h-8 w-8 border border-[#e4e4e7] transition-transform hover:scale-105 duration-200">
                    <AvatarFallback className="bg-neutral-50 text-xs font-light text-black uppercase">
                      {user.username.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 border border-[#f1f1f4] p-1.5 shadow-sm rounded-xl">
                <DropdownMenuLabel className="px-2.5 py-2 font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-light text-[#71717a]">Signed in as</p>
                    <p className="text-sm font-medium text-black truncate">{user.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#f1f1f4]" />
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="flex items-center gap-2 rounded-lg py-2 px-2.5 text-xs font-light text-neutral-600 focus:bg-neutral-50 focus:text-black cursor-pointer">
                  <LayoutDashboard className="h-4 w-4 stroke-[1.5]" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/create-job")} className="flex items-center gap-2 rounded-lg py-2 px-2.5 text-xs font-light text-neutral-600 focus:bg-neutral-50 focus:text-black cursor-pointer">
                  <PlusCircle className="h-4 w-4 stroke-[1.5]" />
                  Create Job
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="flex items-center gap-2 rounded-lg py-2 px-2.5 text-xs font-light text-neutral-600 focus:bg-neutral-50 focus:text-black cursor-pointer">
                  <UserIcon className="h-4 w-4 stroke-[1.5]" />
                  Profile Account
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#f1f1f4]" />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 rounded-lg py-2 px-2.5 text-xs font-light text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 stroke-[1.5]" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-sm font-light text-[#71717a] hover:text-black hover:bg-neutral-50 px-4 py-2 rounded-lg">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-black hover:bg-black/90 text-white text-sm font-light tracking-wide px-4 py-2 rounded-lg shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="flex md:hidden p-1 text-[#71717a] hover:text-black focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#f1f1f4] bg-white px-6 py-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-light tracking-wide ${isActive("/dashboard") ? "text-black font-normal" : "text-[#71717a]"}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-job" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-light tracking-wide ${isActive("/create-job") ? "text-black font-normal" : "text-[#71717a]"}`}
                >
                  Create Job
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-light tracking-wide ${isActive("/profile") ? "text-black font-normal" : "text-[#71717a]"}`}
                >
                  Profile
                </Link>
                <DropdownMenuSeparator className="bg-[#f1f1f4] my-1" />
                <button 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-left text-sm font-light text-red-600"
                >
                  <LogOut className="h-4 w-4 stroke-[1.5]" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-light tracking-wide text-[#71717a]">
                  Features
                </a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-light tracking-wide text-[#71717a]">
                  System
                </a>
                <DropdownMenuSeparator className="bg-[#f1f1f4] my-1" />
                <div className="flex flex-col gap-2.5">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center border-[#e4e4e7] text-sm font-light rounded-lg">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-black hover:bg-black/90 text-white text-sm font-light rounded-lg">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
