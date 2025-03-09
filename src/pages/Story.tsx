import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createScene, isValidScene } from '@/lib/ai';
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CanvasManager } from '@/lib/game/canvas';

export function Story({ currentNode, nextTopic }: { currentNode: { topic: string, paths?: any } | undefined | null, nextTopic?: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvasManager, setCanvasManager] = useState<CanvasManager | null>(null);

    useEffect(() => {
        if (currentNode) {
            createScene(currentNode).then((scene) => {
                if (canvasRef.current) {
                    if (true) {
                        const manager = new CanvasManager(canvasRef.current, scene);
                        setCanvasManager(manager);
                        manager.start();
                    }
                }
            });
        }

        return () => {
            canvasManager?.stop();
        };
    }, [currentNode]);

    if (!currentNode) {
        return null;
    }

    return (
        <Card className="w-[70vw] aspect-video gap-0 p-8 flex flex-col">
            <div className='flex justify-between w-full'>
                <div className='flex flex-col mb-16'>
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
