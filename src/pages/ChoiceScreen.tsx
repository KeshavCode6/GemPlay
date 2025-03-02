import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from "framer-motion";
import { useEffect } from 'react';

export default function ChoiceScreen() {
    useEffect(() => {
        // Disable scrolling on component mount
        document.body.style.overflow = 'hidden';

    }, []);
    return (
        <motion.div
            initial={{ backgroundColor: "#FFFBF2", overflow: "hidden" }}
            animate={{ backgroundColor: "#D9F99D" }}
            exit={{ overflow: "auto" }}
            onAnimationEnd={() => {
                document.body.style.overflow = 'auto';
            }}
            transition={{ duration: 1 }}
            className="min-h-screen bg-lime-200 flex flex-col items-center p-4 md:p-8 "      >
            <img src="/menu.png" className="absolute inset-0 max-h-screen z-10 opacity-5 pointer-events-none" />
            <motion.div
                initial={{ x: -1000, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 14
                }}
                className="flex items-center justify-center z-50 absolute inset-0"
            >
                <Card className="w-[50rem] aspect-video gap-0 p-8 flex flex-col">

                    <p className="text-black font-bold text-2xl"> Choose a topic!</p>
                    <p className="text-muted-foreground">The rest of the story depends on what you pick</p>

                    <div className="grid grid-cols-2 gap-1 mt-8">
                        {["Option 1", "Option 2", "Option 3", "Option 4"].map((option, index) => (
                            <Button key={index} className="w-full h-[8rem] text-lg text-white">
                                {option}
                            </Button>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    )
}
