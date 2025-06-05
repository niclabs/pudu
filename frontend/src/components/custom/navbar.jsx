import React, { useEffect, useState } from "react";
import {
  NavigationMenu,
  // NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  // NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import pudu from "@/assets/pudulogo.png";

export default function Navbar() {
  const [reviewName, setReviewName] = useState(localStorage.getItem("review_name"));

  useEffect(() => {
    const updateReviewName = () => {
      setReviewName(localStorage.getItem("review_name"));
    };

    window.addEventListener("reviewNameUpdated", updateReviewName);
    return () => window.removeEventListener("reviewNameUpdated", updateReviewName);
  }, []);

  return (
    <nav className="w-full bg-violet-900 shadow-sm overflow-hidden  text-violet-50">
      <NavigationMenu className="w-full h-16 px-4 flex items-center">
        <NavigationMenuList className="flex gap-4">
          <NavigationMenuItem>
            <Link to="/">
              <img
                src={pudu}
                alt="Logo"
                className="custom-cursor h-16 w-auto left hover:bg-violet-950  rounded-md"
              />
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to="/studies"
                className=" p-2 text-xl  hover:bg-violet-950 rounded-md"
              >
                Studies
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to="/tags"
                className=" p-2 text-xl  hover:bg-violet-950 rounded-md"
              >
                Tag Management
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            {reviewName && (
              <div className="ml-4 p-2 text-xl text-violet-200 border-l border-r border-violet-700 pl-4 overflow-hidden whitespace-nowrap">
                Review: {reviewName}
              </div>
            )}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}
