import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createScene } from '@/lib/ai';
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Story({ currentNode, nextTopic }: { currentNode: { topic: string, paths?: any } | undefined | null, nextTopic?: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    let startGen = false;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.src = "/menu.png";
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 100, 100);
        };
    }, []);

    useEffect(() => {
        if (currentNode && !startGen) {
            createScene(currentNode);
            startGen = true;
        }
    }, [currentNode])

    if (!currentNode) {
        return;
    }
    return (
        <Card className="w-[70vw] aspect-video gap-0 p-8 flex flex-col">
            <div className='flex justify-between w-full'>
                <div className='flex flex-col  mb-16'>
                    <p className='font-semibold text-muted-foreground text-sm'>You picked</p>
                    <p className='font-bold text-2xl max-w-[90%]'>{currentNode.topic}</p>
                </div>
                <Button variant={"outline"} onClick={nextTopic}>
                    Skip <ChevronRight />
                </Button>
            </div>

            <canvas ref={canvasRef} className="w-full h-full" />
        </Card>
    );
}
