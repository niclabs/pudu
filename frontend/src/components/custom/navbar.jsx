import {
    NavigationMenu,
    // NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    // NavigationMenuTrigger,
  } from "@/components/ui/navigation-menu";
  import { Link } from "react-router-dom";
  import pudu from "@/components/custom/pudulogo.png";

  export default function Navbar() {
    return (
      <nav className="w-full bg-violet-500 shadow-sm text-violet-50">
        <NavigationMenu className="w-full h-16 px-4 flex items-center">
          <NavigationMenuList className="flex gap-4">
            <NavigationMenuItem>
              <img 
                      src={pudu} 
                      alt="Logo" 
                      className="custom-cursor h-16 w-auto left hover:bg-purple-900  rounded-md"
                    />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink>
                <Link to="/tagmanagement" 
                className=" p-2 text-base font-medium hover:bg-purple-900 rounded-md">
                  Tag Management
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink>
                <Link to="/studies" className=" p-2 text-base font-medium hover:bg-purple-900 rounded-md">
                  Study Search
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    );
  }