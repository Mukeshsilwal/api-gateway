import React from 'react';
import NavigationBar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <NavigationBar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
