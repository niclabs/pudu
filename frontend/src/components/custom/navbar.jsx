"use client"

import { useEffect, useState } from "react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom"
import { CircleUser, LogOut, LogIn } from "lucide-react"
import pudu from "@/assets/pudulogo.png"
import { Button } from "@/components/ui/button"
import { AuthService } from "../../utils/authservice";
import { useNavigate } from "react-router-dom"
import { Toaster, toast } from 'sonner'


export default function Navbar() {
  const [reviewName, setReviewName] = useState(sessionStorage.getItem("review_name"))
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.clearTokens();
    sessionStorage.removeItem("review_name");
    sessionStorage.removeItem("review_id");
    setReviewName(null);

    navigate('/');
  };

  const handleNavigation = (e) => {
    const isLogged = localStorage.getItem("app.auth.access") !== null;
    const reviewId = sessionStorage.getItem("review_id");

    if (!isLogged) {
      e.preventDefault();
      toast.error("You must be logged in to access this page.");
      return;
    }

    if (!reviewId || reviewId === "undefined") {
      e.preventDefault();
      toast.error("No review selected.");
    }
  };

  useEffect(() => {
    const updateReviewName = () => {
      setReviewName(sessionStorage.getItem("review_name"))
    }

    window.addEventListener("reviewNameUpdated", updateReviewName)
    return () => window.removeEventListener("reviewNameUpdated", updateReviewName)
  }, [])

  return (
    <nav className="w-full bg-violet-900 shadow-sm overflow-hidden text-violet-50">
      <Toaster richColors />
      <div className="w-full h-16 px-4 flex items-center gap-4">
        {/* Left side navigation items */}
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-4">
            <NavigationMenuItem>
              <Link to="/sysrev" className="block">
                <img
                  src={pudu || "/placeholder.svg"}
                  alt="Logo"
                  className="custom-cursor h-16 w-auto  hover:bg-violet-950 rounded-md"
                />
              </Link>
            </NavigationMenuItem>



            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/studies" onClick={handleNavigation} className="p-2 text-xl rounded-md border border-violet-700 hover:bg-violet-950 cursor-pointer transition-colors duration-150">
                  Studies
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>


            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/tags" onClick={handleNavigation} className="p-2 text-xl rounded-md border border-violet-700 hover:bg-violet-950 cursor-pointer transition-colors duration-150">
                  Tag Management
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>


          </NavigationMenuList>
        </NavigationMenu>

        {/* Center review and dashboard section */}
        <div className="flex px-4 overflow-hidden max-w-[75vw] min-w-0 items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/sysrev" onClick={handleNavigation} className="block">
                    <div
                      title={reviewName ?? "No review selected"}
                      className="p-2 text-xl rounded-md border border-violet-700 hover:bg-violet-950 cursor-pointer transition-colors duration-150 whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
                      {reviewName ? `Review: ${reviewName}` : "No review selected"}
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/dashboard" onClick={handleNavigation} className="block">
                    <div
                      className="p-2 text-xl rounded-md border border-violet-700 hover:bg-violet-950 cursor-pointer transition-colors duration-150">
                      Dashboard
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side user icon */}
        <div className="flex items-center ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <button aria-label="User menu">
                <CircleUser className="h-8 w-8 text-white" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="w-56 p-2 bg-violet-50 rounded-md shadow-md"
              align="end"
            >
              <div className="flex flex-col space-y-1">
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start gap-2 h-9 hover:bg-violet-100 transition-colors rounded"
                  onClick={() => handleLogout()}
                >
                  <div>
                    <LogOut className="h-4 w-4" />
                    Log out
                  </div>
                </Button>


              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  )
}
