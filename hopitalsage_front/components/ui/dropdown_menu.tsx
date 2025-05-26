import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { LogOut, Settings, User } from "lucide-react"
  import { useRouter } from "next/navigation"
  
  export default function HeaderComptable({ ecole, user }) {
    const router = useRouter()
  
    const handleLogout = () => {
      localStorage.removeItem("accessToken")
      router.push("/login")
    }
  
    return (
      <header className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 shadow-md rounded-b-2xl">
        <div>
          <h1 className="text-xl font-bold text-blue-800 dark:text-blue-400">{ecole?.nom}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{ecole?.adresse}</p>
        </div>
  
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
              <span className="text-blue-800 dark:text-blue-400 font-semibold">
                {user?.first_name} {user?.last_name}
              </span>
              {user?.profile_picture && (
                <img
                  src={user.profile_picture}
                  alt="Photo"
                  className="w-10 h-10 rounded-full border border-blue-500 object-cover"
                />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" /> Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/profile/password")}>
              <Settings className="mr-2 h-4 w-4" /> Changer mot de passe
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    )
  }
  