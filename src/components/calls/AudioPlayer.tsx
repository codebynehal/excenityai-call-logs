
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones } from "lucide-react";
import { toast } from "sonner";

interface AudioPlayerProps {
  recordingUrl: string | undefined;
  customerPhone: string;
}

const AudioPlayer = ({ recordingUrl, customerPhone }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Audio playback error:", err);
          toast.error("Failed to play audio recording");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Card className="lg:col-span-2 border-0 card-gradient shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-orange-500" />
          Call Recording
        </CardTitle>
        <CardDescription>
          Listen to the call recording and control playback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordingUrl ? (
          <>
            <audio 
              ref={audioRef} 
              src={recordingUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              className="hidden"
            />
            
            <div className="w-full h-32 bg-background/20 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-orange-400 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-4">
                <div className="text-2xl font-semibold tracking-tighter text-center">
                  {customerPhone}
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{formatTime(currentTime)}</span>
                  <div className="relative w-64 h-1 bg-gray-700 rounded-full">
                    <div 
                      className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{formatTime(duration)}</span>
                </div>
                
                <Button 
                  onClick={togglePlayPause} 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-32 bg-background/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No recording available for this call</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
