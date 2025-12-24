import { useState } from 'react';
import NavigationBar from './Navbar';
import Footer from './Footer';
import { BookingCart } from './booking/BookingCart';
import { CartIcon } from './booking/CartIcon';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <NavigationBar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <Footer />

            {/* Floating Cart Icon */}
            <CartIcon onClick={() => setIsCartOpen(true)} />

            {/* Cart Sidebar */}
            <BookingCart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </div>
    );
};

export default MainLayout;
