import { FloatingAiAssistant } from '@/components/ui/glowing-ai-chat-assistant';

// Demo Component (incorporating ambient background animation)
export default function DemoOne() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      {/* Animated Ambient Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 dark:bg-purple-600/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-500/20 dark:bg-pink-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      
      {/* Main Container */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center h-full space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground drop-shadow-sm max-w-4xl">
            Trải nghiệm tương lai của AI với giao diện Widget siêu mượt
          </h1>
          <p className="mt-6 text-lg md:text-xl leading-8 text-muted-foreground">
            Nhấn vào nút Chat nổi ở góc dưới bên phải màn hình để bắt đầu cuộc trò chuyện.
          </p>
        </div>
        <FloatingAiAssistant />
      </div>
    </div>
  );
}
