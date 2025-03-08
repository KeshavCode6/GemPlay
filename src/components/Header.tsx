import { ChevronLeft, Gem } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from './ui/button'

export default function Header() {
    return (
        <header className="w-full max-w-4xl flex items-center justify-between mt-12 mb-8 z-50">
            <div className="flex items-center gap-2 ">
                <Gem className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold ">GemPlay</h1>
            </div>
            <Link to="/">
                <Button
                    aria-label="Settings"
                    className="text-white"
                    style={{ padding: "1.2rem 1rem" }}
                >
                    <ChevronLeft /> Back
                </Button>
            </Link>
        </header>
    )
}
