/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, User, Loader2, User2, MessageCircleCode, LocateIcon, LogIn, Home, Users, BarChart, Activity } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { FaAccusoft, FaEnvelope } from 'react-icons/fa';
import { EnvelopeIcon } from '@heroicons/react/24/outline';


export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('/');
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {

    }, [user]);


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60);
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('keydown', handleEscapeKey);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    const handleSignOut = async () => {
        try {
            setIsMobileMenuOpen(false); // Close mobile menu when signing out
            await signOut();
            window.location.href = "/"
            router.replace("/")

        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    const menuItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'VIP Page', href: '/pricing' },
        { label: 'Contact Us', href: '/contact' },
        // { label: 'Blog', href: '/blog' }
    ];

    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleDropdown();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById('user-dropdown');
            const button = document.getElementById('user-menu-button');

            if (dropdown && button &&
                !dropdown.contains(event.target as Node) &&
                !button.contains(event.target as Node)) {
                setDropdownVisible(false);
            }
        };

        if (dropdownVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownVisible]);

    const isCurrentPath = (path: string) => {
        if (typeof window === 'undefined') return false;
        return pathname === path || window.location.pathname === path;
    };


    useEffect(() => {
        const currentPath = pathname;
        setActiveMenu(isCurrentPath(currentPath) ? currentPath : '/');
    }, []);


    return (
        <nav suppressHydrationWarning className={"w-full fixed top-0 left-0 z-50 transition-all duration-300 shadow-xl bg-gray-900"}>
            <div className="container w-full py-4 lg:py-2 mx-auto px-4">
                <div className="flex items-center justify-between h-10 md:h-12 lg:h-18 xl:h-20">
                    <Link href="/" className="flex items-center space-x-2">
                        <img
                            src="https://bigboystips.com/img.png"
                            alt="BigBoysTips Logo"
                            className="h-10 md:h-12 lg:h-18 xl:h-20 w-auto"
                        />
                        {/* <span className={`text-xl font-semibold text-white`}>
                            BigBoysTips
                        </span> */}
                    </Link>

                    <div suppressHydrationWarning className="hidden lg:flex items-center space-x-8">
                        {menuItems.map((item) => (
                            <Link
                                suppressHydrationWarning
                                key={item.href}
                                href={item.href}
                                className={`font-normal uppercase transition-colors ${activeMenu === item.href ? 'text-orange-500 underline underline-offset-8' : 'text-white hover:text-orange-300'}`}
                                onClick={() => setActiveMenu(item.href)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {pathname.includes("/predictions") && <div
                            className={`font-normal uppercase transition-colors ${pathname.includes("/predictions") ? 'text-orange-500 underline underline-offset-8' : 'text-white hover:text-orange-300'}`}
                        >
                            <span>Predictions</span>
                        </div>}
                        {pathname.includes("/profile") && <div
                            className={`font-normal uppercase transition-colors ${pathname.includes("/profile") ? 'text-orange-500 underline underline-offset-8' : 'text-white hover:text-orange-300'}`}
                        >
                            <span>User Profile</span>
                        </div>}
                        {pathname.includes("/legal") && <div
                            className={`font-normal uppercase transition-colors ${pathname.includes("/legal") ? 'text-orange-500 underline underline-offset-8' : 'text-white hover:text-orange-300'}`}
                        >
                            <span>Legalities</span>
                        </div>}
                    </div>

                    <div className="hidden lg:flex items-center space-x-4">
                        {loading ? (
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isScrolled ? 'bg-orange-50 text-orange-600' : 'bg-white/10 text-white'
                                }`}>
                                {/*  <Loader2 className="animate-spin" size={20} />
                               <span>Loading...</span> */}
                            </div>
                        ) : user ? (
                            <div className="relative text-sm">
                                <button
                                    id="user-menu-button"
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-white/10 text-white hover:bg-white/20`}
                                    onClick={toggleDropdown}
                                    onKeyDown={handleKeyDown}
                                    aria-haspopup="true"
                                    aria-expanded={dropdownVisible}
                                    aria-controls="user-dropdown"
                                >
                                    <User size={20} />
                                    <span>{user.username || 'Account'}</span>
                                    <ChevronDown
                                        size={16}
                                        className={`transform transition-transform duration-200 ${dropdownVisible ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                <div
                                    id="user-dropdown"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu-button"
                                    className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 transition-all duration-200 transform origin-top-right ${dropdownVisible
                                        ? 'scale-100 opacity-100'
                                        : 'scale-95 opacity-0 pointer-events-none'
                                        }`}  >

                                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition-colors cursor-default">
                                        <User2 className='size-4' />
                                        <p className=" text-neutral-700">  {user.username} </p>
                                    </div>

                                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition-colors cursor-default">
                                        <EnvelopeIcon className='size-4' />
                                        <p className=" text-neutral-700 truncate">  {user.email} </p>
                                    </div>

                                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition-colors cursor-default">
                                        <Home className='size-4' />
                                        <p className=" text-neutral-700">  {user.location?.country} ({user.location?.currencycode})</p>
                                    </div>

                                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition-colors cursor-pointer">
                                        <FaAccusoft className='size-4' />
                                        <Link
                                            href="/profile"
                                            role="menuitem"
                                            className="block text-neutral-700"
                                            onClick={() => setDropdownVisible(false)}>
                                            User Account
                                        </Link>
                                    </div>
                                    {user.role === 'ADMIN' && (
                                        <>
                                            <Link
                                                href="/dashboard"
                                                role="menuitem"
                                                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-orange-50 transition-colors"
                                                onClick={() => setDropdownVisible(false)}
                                            >
                                                <Home className="size-4" />
                                                Dashboard
                                            </Link>
                                            {/* <Link
                                                href="/dashboard/users"
                                                role="menuitem"
                                                className="flex items-center gap-2 px-4 py-2 text-orange-700 hover:bg-orange-50 transition-colors"
                                                onClick={() => setDropdownVisible(false)}
                                            >
                                                <Users className="size-4" />
                                                Manage Users
                                            </Link>
                                            <Link
                                                href="/dashboard/predictions/create"
                                                role="menuitem"
                                                className="flex items-center gap-2 px-4 py-2 text-orange-700 hover:bg-orange-50 transition-colors"
                                                onClick={() => setDropdownVisible(false)}
                                            >
                                                <BarChart className="size-4" />
                                                Add Prediction
                                            </Link> */}
                                        </>
                                    )}
                                    <hr className="my-2 border-neutral-200" />
                                    <button
                                        onClick={handleSignOut}
                                        role="menuitem"
                                        className="flex items-center gap-2 w-full text-left px-4 py-1 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogIn className="size-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link href="/signin" className={`px-4 py-2 rounded-lg transition-colors ${isScrolled ? 'text-orange-700 hover:text-orange-600' : 'text-white hover:text-white/80'
                                    }`}>
                                    Sign In
                                </Link>
                                <Link href="/signup" className={`px-4 py-2 rounded-lg transition-colors ${isScrolled ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-white text-orange-600 hover:bg-white/90'
                                    }`}>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`lg:hidden transition-colors text-white hover:text-white/80`}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            <div className={`lg:hidden fixed inset-y-0 right-0 transform w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out h-screen z-50 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="p-6">
                    <div className="flex flex-col space-y-6">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-neutral-700 hover:text-orange-600 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <hr className="my-4 border border-neutral-200" />
                        {user && <div className="flex flex-col space-y-6">
                            <div className="flex items-center gap-2  hover:bg-orange-50 transition-colors cursor-default">
                                <User2 className='size-4' />
                                <p className=" text-neutral-700">  {user.username} </p>
                            </div>

                            <div className="flex items-center gap-2  hover:bg-orange-50 transition-colors cursor-default">
                                <EnvelopeIcon className='size-4' />
                                <p className=" text-neutral-700 truncate">  {user.email} </p>
                            </div>

                            <div className="flex items-center gap-2 hover:bg-orange-50 transition-colors cursor-default">
                                <Home className='size-4' />
                                <p className=" text-neutral-700">  {user.location?.country} ({user.location?.currencycode})</p>
                            </div>


                        </div>}
                        {loading ? (
                            <div className="flex items-center space-x-2 text-orange-600">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Loading...</span>
                            </div>
                        ) : user ? (
                            <>
                                <hr className="my-4 border border-neutral-200" />
                                <Link
                                    href="/profile"
                                    className="text-neutral-700 hover:text-orange-600 font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    User Account
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="text-neutral-700 hover:text-orange-600 font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>

                                    </>
                                )}
                                <hr className="my-4 border border-neutral-200" />

                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-red-600 hover:text-red-700 font-medium text-left"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-4">
                                <Link
                                    href="/signin"
                                    className="text-orange-700 hover:text-orange-600 font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-center"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </nav>
    );
}
