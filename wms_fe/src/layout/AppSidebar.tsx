import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

// 1. IMPOR 'useAuth' UNTUK MENGECEK ROLE
import { useAuth } from "../context/AuthContext";

// 2. IMPOR SEMUA IKON YANG KITA BUTUHKAN
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  TableIcon,
  UserCircleIcon,
  ListIcon, // Untuk Admin (Forms/Input)
  BoxCubeIcon, // Untuk Admin (Stok),
  PlugInIcon,
  TimeIcon,
} from "../icons"; // Pastikan path ke 'icons' Anda benar

import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import Logo from "../components/common/Logo";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// --- 3. KITA DEFINISIKAN SEMUA MENU UNTUK SETIAP ROLE ---

// Menu untuk Supervisor (sesuai brief)
const supervisorNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/supervisor/dashboard",
  },
  {
    icon: <TableIcon />,
    name: "Verifikasi Laporan",
    path: "/supervisor/reports",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
];

// Menu untuk Admin (sesuai brief)
const adminNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    icon: <ListIcon />,
    name: "Input Invoice (Outbound)",
    path: "/admin/outbounds", // Nanti Anda buat halamannya
  },
  {
    icon: <TableIcon />,
    name: "Generate Laporan",
    path: "/admin/reports",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Lihat Stok Cabang",
    path: "/admin/stock", // Nanti Anda buat halamannya
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
];

// Menu untuk Superadmin (sesuai brief)
const superadminNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/superadmin/dashboard",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Products",
    path: "/superadmin/products",
  },
  {
    icon: <TableIcon />,
    name: "Stok Cabang",
    path: "/superadmin/branchstock",
  },
  {
    icon: <BoxCubeIcon />, // Icon Inbound
    name: "Kirim Stok (Inbound)",
    path: "/superadmin/inbound",
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    path: "/superadmin/users",
  },
  {
    icon: <PlugInIcon />,
    name: "Branches",
    path: "/superadmin/branches",
  },
  {
    icon: <TimeIcon />,
    name: "Activity Logs",
    path: "/superadmin/activitylogs",
  },
];

// Menu untuk User (Customer)
const userNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Beranda",
    path: "/",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Katalog Produk",
    path: "/books",
  },
  {
    icon: <ListIcon />,
    name: "Form Pemesanan",
    path: "/order",
  },
  {
    icon: <TableIcon />,
    name: "Profil Saya",
    path: "/profile",
  },
];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  
  // --- 4. AMBIL USER YANG SEDANG LOGIN ---
  const { user } = useAuth();

  // --- 5. GANTI 'navItems' STATIS MENJADI DINAMIS ---
  // 'useMemo' akan memilih menu yang benar berdasarkan role user
  const navItems = useMemo(() => {
    const role = user?.role;

    switch (role) {
      case "admin":
        return adminNavItems;
      case "supervisor":
        return supervisorNavItems;
      case "superadmin":
        return superadminNavItems;
      case "user":
        return userNavItems;
      default:
        // Fallback jika user aneh atau belum ter-load
        return [
          {
            icon: <UserCircleIcon />,
            name: "User Profile",
            path: "/profile",
            // subItems is optional, but explicitly set to undefined for type safety
            subItems: undefined,
          },
        ];
    }
  }, [user]); // 'navItems' akan dihitung ulang setiap kali 'user' berubah

  // (Sisa kode di bawah ini 99% sama, tidak perlu diubah)

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems && Array.isArray(nav.subItems)) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]); // Tambahkan navItems sebagai dependensi

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          <Logo 
            showText={isExpanded || isHovered || isMobileOpen}
            className={!isExpanded && !isHovered ? "lg:justify-center" : ""}
          />
        </Link>
      </div>

      {/* Old logo code - commented out
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;