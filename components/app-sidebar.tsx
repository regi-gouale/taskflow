"use client";

import {
  IconCalendarWeek,
  IconChartBar,
  IconFolders,
  IconHelpCircle,
  IconLayoutDashboard,
  IconListCheck,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navMain = [
  { title: "Tableau de bord", url: "/dashboard", icon: IconLayoutDashboard },
  { title: "Mes tâches", url: "/dashboard/tasks", icon: IconListCheck },
  { title: "Projets", url: "/dashboard/projects", icon: IconFolders },
  { title: "Calendrier", url: "/dashboard/calendar", icon: IconCalendarWeek },
  { title: "Rapports", url: "/dashboard/reports", icon: IconChartBar },
  { title: "Équipe", url: "/dashboard/team", icon: IconUsers },
];

const navSecondary = [
  { title: "Paramètres", url: "/dashboard/settings", icon: IconSettings },
  { title: "Aide", url: "/dashboard/help", icon: IconHelpCircle },
];

function isActivePath(pathname: string, url: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props} variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="group-data-[collapsible=icon]:p-1.5!"
            >
              <Link href="/dashboard">
                <Image
                  src="/icon-taskflow.svg"
                  alt="TaskFlow"
                  width={32}
                  height={32}
                  className="size-8 shrink-0"
                />
                <span className="font-heading text-base font-semibold tracking-tight">
                  Task<span className="text-primary">Flow</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pilotage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActivePath(pathname, item.url)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActivePath(pathname, item.url)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
