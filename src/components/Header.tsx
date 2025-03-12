import { ChevronLeft, Gem } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from './ui/button'

// A UI component with the logo of the app and a button to go back
export default function Header() {
    return (
        <header className="w-full max-w-4xl flex items-center justify-between mt-12 mb-8 z-50">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
                <Gem className="h-8 w-8 text-primary" /> {/* App Logo */}
                <h1 className="text-2xl font-bold">GemPlay</h1> {/* App Name */}
            </div>

            {/* Back Button */}
            <Link to="/"> {/* Navigation link to the home page */}
                <Button
                    aria-label="Go back"
                    className="text-white"
                    style={{ padding: "1.2rem 1rem" }} // Custom padding for button
                >
                    <ChevronLeft /> Back {/* Icon and text for the back button */}
                </Button>
            </Link>
        </header>
    )
}
