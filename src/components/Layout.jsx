import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NexAIAssistant from './NexAIAssistant';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-200">
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                    <Topbar toggleSidebar={toggleSidebar} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6 lg:p-8 transition-colors duration-200">
                        <div className="max-w-8xl w-full mx-auto dark:text-slate-200 px-2 lg:px-6">
                            <Outlet />
                        </div>
                    </main>
            </div>

            <NexAIAssistant />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
