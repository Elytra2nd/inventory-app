import { useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';
import { LayoutDashboard, Box, FileText, Menu, LogOut, ChevronRight, Home } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/Components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import FlashToaster from '@/Components/FlashToaster';

interface Props {
  user: User;
  header?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Authenticated({
  user,
  children,
  breadcrumbs = [],
}: PropsWithChildren<Props>) {
  const [isOpen, setIsOpen] = useState(false);
  const { url } = usePage();

  // KONFIGURASI MENU SIDEBAR
  const navItems = [
    {
      label: 'Dashboard',
      href: route('dashboard'),
      icon: LayoutDashboard,
      active: url.startsWith('/dashboard'),
    },
    {
      label: 'Aset & Inventaris',
      href: route('assets.index'),
      icon: Box,
      // Cek kedua kemungkinan URL agar highlight tetap nyala
      active: url.startsWith('/inventories') || url.startsWith('/assets'),
    },
    {
      label: 'Pusat Laporan', // Label lebih deskriptif
      href: route('reports.index'), // Arahkan ke Halaman Index, bukan download langsung
      icon: FileText,
      active: url.startsWith('/reports'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Komponen Toaster untuk Notifikasi Sukses/Error */}
      <FlashToaster />

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white h-screen fixed inset-y-0 z-50">
        <div className="p-6 border-b h-16 flex items-center">
          <span className="font-bold text-xl tracking-tight text-blue-600">MajiAssets.</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* TOP NAVBAR */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                {/* Mobile Sidebar Content */}
                <div className="p-6 border-b">
                  <span className="font-bold text-xl text-blue-600">MajiAssets.</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        item.active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className="h-4 w-4" /> {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* BREADCRUMBS */}
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={route('dashboard')}>
                    <Home className="h-4 w-4" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    <BreadcrumbSeparator>
                      <ChevronRight />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="text-muted-foreground text-xs">
                Logged in as {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => route('profile.edit')}>Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600" asChild>
                <Link href={route('logout')} method="post" as="button" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-8 space-y-6">{children}</div>
      </main>
    </div>
  );
}
