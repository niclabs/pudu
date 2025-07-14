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
import { AuthService } from '/src/utils/authservice.jsx';
import { useNavigate } from "react-router-dom"


export default function Navbar() {
  const [reviewName, setReviewName] = useState(localStorage.getItem("review_name"))
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.clearTokens();
    localStorage.removeItem("review_name");
    localStorage.removeItem("review_id");
    setReviewName(null);

    navigate('/');
  };

  useEffect(() => {
    const updateReviewName = () => {
      setReviewName(localStorage.getItem("review_name"))
    }

    window.addEventListener("reviewNameUpdated", updateReviewName)
    return () => window.removeEventListener("reviewNameUpdated", updateReviewName)
  }, [])

  return (
    <nav className="w-full bg-violet-900 shadow-sm overflow-hidden text-violet-50">
      <div className="w-full h-16 px-4 flex items-center justify-between">
        {/* Left side navigation items */}
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-4">
            <NavigationMenuItem>
                <img
                  src={pudu || "/placeholder.svg"}
                  alt="Logo"
                  className="custom-cursor h-16 w-auto hover:bg-violet-950 rounded-md"
                />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/studies" className="p-2 text-xl hover:bg-violet-950 rounded-md">
                  Studies
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/tags" className="p-2 text-xl hover:bg-violet-950 rounded-md">
                  Tag Management
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Center review section */}
        <div className="flex-1 px-4 overflow-hidden max-w-[75vw] min-w-0">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/sysrev" className="block">
                    <div
                      title={reviewName ?? "No review selected"}
                      className="p-2 text-xl border-l border-r border-violet-700 pl-4 pr-4 hover:bg-violet-950 cursor-pointer"
                    >
                      Review: {reviewName ?? "No review selected"}
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side user icon */}
        <div className="flex items-center">
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
